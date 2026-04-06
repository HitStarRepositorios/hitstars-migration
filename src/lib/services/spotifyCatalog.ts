import { getSpotifyAccessToken } from "./spotify";

export async function fetchSpotifyArtistReleases(artistId: string) {
  const token = await getSpotifyAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,appears_on&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Spotify API error");
  }

  const data = await res.json();

  return data.items.map((album: any) => ({
    spotifyId: album.id,
    name: album.name,
    releaseDate: album.release_date,
    totalTracks: album.total_tracks,
    image: album.images?.[0]?.url || null,
  }));
}