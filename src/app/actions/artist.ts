"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Platform } from "@prisma/client";
import { redirect } from "next/navigation";
import { verifySpotifyArtist } from "@/lib/services/spotify";
import {
  extractSpotifyId,
  extractAppleMusicId,
  extractYoutubeChannelId,
} from "@/lib/platformValidators";

/* ======================================================
   CREAR ARTISTA
====================================================== */

export async function createArtistAction(
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const bio = formData.get("bio") as string;
  const genre = formData.get("genre") as string;
  const subGenre = formData.get("subGenre") as string | null;

  if (!genre) {
    return { error: "El género es obligatorio." };
  }

  try {
    await prisma.artist.upsert({
      where: { userId: session.id },
      update: {
        bio,
        genre,
        subGenre: subGenre || null,
      },
      create: {
        userId: session.id,
        bio,
        genre,
        subGenre: subGenre || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create artist profile." };
  }
}

/* ======================================================
   GUARDAR PLATAFORMAS (MULTI)
====================================================== */

export async function savePlatformsAction(data: {
  platforms: {
    platform: Platform;
    url: string;
    isPrimary: boolean;
  }[];
}) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const artist = await prisma.artist.findUnique({
    where: { userId: session.id },
  });

  if (!artist) return { error: "Artist not found" };

  // 🔹 Si no hay plataformas → simplemente limpiamos todas
  if (!data.platforms || data.platforms.length === 0) {
    await prisma.artistPlatform.deleteMany({
      where: { artistId: artist.id },
    });

    await prisma.user.update({
      where: { id: session.id },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });

    return { success: true };
  }

  // 🔹 Limpiamos todas antes de reinsertar (más limpio que upsert múltiple)
  await prisma.artistPlatform.deleteMany({
    where: { artistId: artist.id },
  });

for (const p of data.platforms) {
  let platformUserId: string | null = null;
  let spotifyArtist: any = null;

  switch (p.platform) {
case Platform.SPOTIFY:

  spotifyArtist = await verifySpotifyArtist(p.url);

  if (!spotifyArtist) {
    return { error: "Perfil de Spotify no válido" };
  }

  platformUserId = spotifyArtist.id;
  break;
    case Platform.APPLE_MUSIC:
      console.log(`[DEBUG] Verificando Apple Music: ${p.url}`);
      platformUserId = extractAppleMusicId(p.url);
      console.log(`[DEBUG] ID extraído: ${platformUserId}`);
      break;
    case Platform.YOUTUBE:
      platformUserId = extractYoutubeChannelId(p.url);
      break;
    default:
      platformUserId = p.url;
  }

  if (!platformUserId) {
    console.warn(`URL inválida para ${p.platform}: ${p.url}`);
    continue;
  }

await prisma.artistPlatform.create({
  data: {
    artistId: artist.id,
    platform: p.platform,
    url: p.url,
    platformUserId,
    isPrimary: p.isPrimary,
    verified: true,
    verifiedAt: new Date(),
    metadata: spotifyArtist
      ? {
          ...spotifyArtist,
          platform: "SPOTIFY",
        }
      : null,

  },
});
}

  // 🔹 Marcar onboarding completado (si aplica)
  await prisma.user.update({
    where: { id: session.id },
    data: {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    },
  });

  return { success: true };
}