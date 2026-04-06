import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { trackId, field, value } = body;

  if (!trackId || !field) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (field === "artists") {
    // 1. Borrar anteriores
    await prisma.trackArtist.deleteMany({
      where: { trackId }
    });

    // 2. Crear nuevos
    if (Array.isArray(value)) {
      await prisma.trackArtist.createMany({
        data: value.map((a: any) => ({
          trackId: trackId,
          artistName: a.artistName,
          role: a.role,
          isPrimary: Number(a.isPrimary) === 1 || a.isPrimary === true,
          spotifyId: a.spotifyId,
          appleId: a.appleId,
          youtubeId: a.youtubeId,
          spotifyUrl: a.spotifyUrl,
          appleUrl: a.appleUrl,
          youtubeUrl: a.youtubeUrl,
          instagramUrl: a.instagramUrl,
        }))
      });
    }
  } else {
    // Para cualquier otro campo estándar (title, etc)
    await prisma.track.update({
      where: { id: trackId },
      data: {
        [field]: value,
      },
    });
  }

  return NextResponse.json({ success: true });
}