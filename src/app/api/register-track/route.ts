import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      releaseId,
      title,
      fileUrl,
      duration,
      sampleRate,
      bitDepth,
      codec,
      estimatedBPM,
      estimatedTone,
      segments
    } = await req.json();

    if (!releaseId || !fileUrl) {
      return NextResponse.json({ error: "Faltan datos (releaseId o fileUrl)" }, { status: 400 });
    }

    const release = await prisma.release.findUnique({
      where: { id: releaseId },
      include: { tracks: true, releaseArtists: true },
    });

    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const releaseMainArtist =
      release.releaseArtists?.find((a) => a.isPrimary)?.artistName || "";

    const trackNumber = (release.tracks?.length || 0) + 1;
    const suggestedPreview = (segments && Array.isArray(segments)) 
      ? segments.find((s: any) => s.type === "chorus")?.start || 0 
      : 0;

    // Sanitizar segmentos
    const sanitizedSegments = (segments && Array.isArray(segments)) 
      ? segments.map((s: any) => ({
          start: Number(s.start) || 0,
          end: Number(s.end) || 0,
          type: String(s.type) || "chorus"
        }))
      : [];

    const track = await prisma.track.create({
      data: {
        releaseId,
        title: title || "Sin título",
        trackNumber,
        duration: duration ? Number(duration) : null,
        fileUrl,
        audioCodec: codec || "WAV",
        sampleRate: sampleRate ? Number(sampleRate) : null,
        bitDepth: bitDepth ? Number(bitDepth) : null,
        previewStart: Number(suggestedPreview) || 0,
        estimatedBPM: estimatedBPM ? Number(estimatedBPM) : null,
        estimatedTone: estimatedTone ? String(estimatedTone) : null,
        segments: {
          createMany: {
            data: sanitizedSegments
          }
        }
      },
    });

    // Crear artista principal por defecto con seguridad
    try {
      await prisma.trackArtist.create({
        data: {
          trackId: track.id,
          artistName: releaseMainArtist || "Unknown Artist",
          role: "MAIN",
          isPrimary: true,
        },
      });
    } catch (e) {
      console.warn("Could not create default track artist:", e);
    }

    const fullTrack = await prisma.track.findUnique({
      where: { id: track.id },
      include: { segments: true, artists: true },
    });

    return NextResponse.json({ success: true, track: fullTrack });
  } catch (error: any) {
    console.error("FATAL ERROR in register-track:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor", 
      details: error.message 
    }, { status: 500 });
  }
}
