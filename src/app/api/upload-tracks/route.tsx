import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseBuffer } from "music-metadata";
import { uploadToSupabase } from "@/lib/supabaseStorage";

// Permitir archivos grandes (WAV puede ser 100MB+)
export const maxDuration = 60;

type TrackAnalysis = {
  bpm: number | null;
  tone: string | null;
  danceability: string | null;
  segments: { start: number; end: number; type: string }[];
};

export async function POST(req: NextRequest) {

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const releaseId = formData.get("releaseId") as string;
  const files = formData.getAll("files") as File[];

  if (!releaseId || !files.length) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: {
      tracks: true,
      releaseArtists: true
    },
  });

  if (!release) {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }

  const releaseMainArtist =
    release.releaseArtists?.find(a => a.isPrimary)?.artistName || "";

  /*
  VALIDACIÓN SEGÚN TIPO DE LANZAMIENTO
  */

  const existingTracks = release.tracks.length;
  const incomingTracks = files.length;

  if (release.distributionType === "SINGLE") {
    if (existingTracks + incomingTracks > 1) {
      return NextResponse.json(
        { error: "Un Single solo puede tener 1 pista." },
        { status: 400 }
      );
    }
  }

  if (release.distributionType === "EP") {
    if (existingTracks + incomingTracks > 6) {
      return NextResponse.json(
        { error: "Un EP no puede tener más de 6 pistas." },
        { status: 400 }
      );
    }
  }

  let lastTrackNumber = release.tracks.length;

  const createdTracks = [];
  const rejectedFiles: { name: string; reason: string }[] = [];

  for (let i = 0; i < files.length; i++) {

    const file = files[i];

    console.log("Procesando archivo:", file.name);

    if (!file.type.includes("audio")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos de audio." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    /*
    LEER METADATA DEL AUDIO (desde buffer, sin escribir a disco)
    */

    let duration: number | null = null;
    let sampleRate: number | null = null;
    let bitDepth: number | null = null;
    let codec: string | null = null;

    try {

      const metadata = await parseBuffer(buffer);

      duration = metadata.format.duration
        ? Math.round(metadata.format.duration)
        : null;

      sampleRate = metadata.format.sampleRate ?? null;
      bitDepth = metadata.format.bitsPerSample ?? null;
      codec = metadata.format.codec ?? "PCM";

      /*
      VALIDACIONES PROFESIONALES DE DSP
      */

      if (metadata.format.container !== "WAVE") {
        rejectedFiles.push({
          name: file.name,
          reason: "Debe ser un archivo WAV válido"
        });
        continue;
      }

      if (sampleRate !== 44100) {
        rejectedFiles.push({
          name: file.name,
          reason: "Debe ser 44.1 kHz"
        });
        continue;
      }

      if (![16, 24].includes(bitDepth || 0)) {
        rejectedFiles.push({
          name: file.name,
          reason: "Debe ser 16-bit o 24-bit"
        });
        continue;
      }

    } catch {

      return NextResponse.json(
        { error: "No se pudo leer el archivo de audio." },
        { status: 400 }
      );

    }

    /*
    SUBIR A SUPABASE STORAGE
    */

    lastTrackNumber++;
    const trackNumber = lastTrackNumber;
    const filename = `${releaseId}-${Date.now()}-${i}.wav`;

    let fileUrl: string;

    try {
      fileUrl = await uploadToSupabase("audio", filename, buffer, "audio/wav");
    } catch (err: any) {
      console.error("Error subiendo audio a Supabase:", err);
      return NextResponse.json(
        { error: `Error subiendo audio: ${err.message}` },
        { status: 500 }
      );
    }

    /*
    CREAR TRACK EN BASE DE DATOS
    */

    const track = await prisma.track.create({
      data: {
        releaseId,
        title: file.name.replace(/\.[^/.]+$/, ""),
        trackNumber,
        duration,
        fileUrl,

        audioCodec: codec,
        sampleRate,
        bitDepth,

        previewStart: 0,

        estimatedBPM: null,
        estimatedTone: null,
        estimatedDanceability: null
      },
    });

    await prisma.trackArtist.create({
      data: {
        trackId: track.id,
        artistName: releaseMainArtist,
        role: "MAIN",
        isPrimary: true
      }
    });

    console.log("Track creado:", track.title);

    createdTracks.push(track);

  }

  /*
  DEVOLVER TRACKS CREADOS
  */

  const tracks = await prisma.track.findMany({
    where: {
      id: {
        in: createdTracks.map((t) => t.id)
      }
    },
    include: {
      segments: true,
      artists: true
    }
  });

  tracks.sort((a, b) => a.trackNumber - b.trackNumber);

  console.log("Tracks creados total:", createdTracks.length);

  return NextResponse.json({
    success: true,
    tracks,
    rejectedFiles
  });

}