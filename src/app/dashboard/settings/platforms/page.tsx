import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArtistPlatform } from "@prisma/client";
import PlatformsManager from "./PlatformsManager";

export default async function PlatformsPage() {

  const session = await getSession();
  if (!session) redirect("/login");

  const artist = await prisma.artist.findUnique({
    where: { userId: session.id },
    include: { platforms: true },
  });

  if (!artist) redirect("/onboarding/profile");

  return (
    <PlatformsManager
      existingPlatforms={artist.platforms as ArtistPlatform[]}
    />
  );
}