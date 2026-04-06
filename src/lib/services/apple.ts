import { extractAppleMusicId } from "../platformValidators";

export async function verifyAppleArtist(url: string) {
  console.log(`[SERVICE] Verificando Apple Music: ${url}`);
  const artistId = extractAppleMusicId(url);

  if (!artistId) {
    console.log(`[SERVICE] Fallo: No se pudo extraer ID de ${url}`);
    return null;
  }

  console.log(`[SERVICE] ID extraído con éxito: ${artistId}`);

  // buscar albums del artista
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${artistId}&entity=album`,
    { cache: "no-store" }
  );

  const data = await res.json();

  if (!data.results?.length) return null;

  const artist = data.results[0];

  // buscar artwork en albums
  const album = data.results.find((r: any) => r.artworkUrl100);

  const image =
    album?.artworkUrl100?.replace("100x100", "500x500") || null;

  return {
    id: artist.artistId,
    name: artist.artistName,
    image,
    appleUrl: url
  };

}