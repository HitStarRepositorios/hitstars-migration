import { NextResponse } from "next/server";
import { fetchSpotifyArtistReleases } from "@/lib/services/spotifyCatalog";

export async function POST(req: Request) {
  const { artistId } = await req.json();

  if (!artistId) {
    return NextResponse.json({ error: "Missing artistId" });
  }

  try {
    const releases = await fetchSpotifyArtistReleases(artistId);

    return NextResponse.json({
      success: true,
      releases,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch catalog",
    });
  }
}