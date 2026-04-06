import { extractSpotifyId } from "../platformValidators";
import { prisma } from "@/lib/prisma";

let cachedToken: string | null = null;
let tokenExpires = 0;

export async function getSpotifyAccessToken(): Promise<string | null> {

  const now = Date.now();

  if (cachedToken && now < tokenExpires) {

    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");


  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    console.error("Spotify token error", await res.text());
    return null;
  }

  const data = await res.json();

  cachedToken = data.access_token;

  // token dura 1h
  tokenExpires = Date.now() + (data.expires_in * 1000) - 60000;



  return cachedToken;
}




export async function verifySpotifyArtist(url: string) {


  const artistId = extractSpotifyId(url);

  



  if (!artistId) return null;

  // ---------- CACHE CHECK ----------

const cached = await prisma.spotifyArtistCache.findUnique({
  where: { artistId }
});

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_TTL) {



  return {
    id: cached.artistId,
    name: cached.name,
    image: cached.image,
    spotifyUrl: `https://open.spotify.com/artist/${cached.artistId}`,
    followers: cached.followers,
    popularity: cached.popularity,
    tracksSample: cached.tracks
  };

}

  const token = await getSpotifyAccessToken();

  if (!token) return null;

  // ---------- ARTIST ----------
  const artistRes = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      cache: "no-store"
    }
  );

  if (!artistRes.ok) {
  console.log("Spotify artist request failed", artistRes.status);
  return null;
}

const artist: any = await artistRes.json();



  // ---------- ALBUMS ----------
  const albumsRes = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?limit=5&include_groups=album,single`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    }
  );

if (!albumsRes.ok) {

  console.log("Spotify albums request failed", albumsRes.status);

  const retryAfter = albumsRes.headers.get("retry-after");
  console.log("Retry after:", retryAfter);

  return null;
}

const albumsData = await albumsRes.json();



  let tracks: any[] = [];

  for (const album of albumsData.items?.slice(0, 3) ?? []) {

    const albumTracksRes = await fetch(
      `https://api.spotify.com/v1/albums/${album.id}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!albumTracksRes.ok) {
  continue;
}

const tracksData = await albumTracksRes.json();

    if (Array.isArray(tracksData?.items)) {
      tracks = tracks.concat(tracksData.items);
    }

  }



  // ---------- POPULARITY ----------
  let popularity = 0;

  const followers = artist?.followers?.total ?? 0;

  if (typeof artist?.popularity === "number") {

    popularity = artist.popularity;

  } else {

    // fallback basado en tamaño de catálogo
    const catalogScore = Math.min(100, tracks.length * 2);

    popularity = catalogScore;

  }

// ---------- CACHE SAVE ----------

await prisma.spotifyArtistCache.upsert({

  where: { artistId },

  update: {
    name: artist.name,
    image: artist.images?.[0]?.url ?? null,
    followers,
    popularity: Math.round(popularity),
    tracks: tracks.slice(0,5).map((t:any) => ({
      name: t.name
    }))
  },

  create: {
    artistId,
    name: artist.name,
    image: artist.images?.[0]?.url ?? null,
    followers,
    popularity: Math.round(popularity),
    tracks: tracks.slice(0,5).map((t:any) => ({
      name: t.name
    }))
  }

});

console.log("Spotify cache hit", artistId);

  // ---------- RESULT ----------
  return {
    id: artist.id,
    name: artist.name,
    image: artist.images?.[0]?.url ?? null,
    spotifyUrl: artist.external_urls?.spotify ?? null,
    followers,
    popularity: Math.round(popularity),
    tracksSample: tracks.slice(0,5).map((t:any) => ({
      name: t.name
    }))
  };
}