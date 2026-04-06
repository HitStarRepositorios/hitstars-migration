/* ======================================================
   SPOTIFY
====================================================== */

export function extractSpotifyId(url: string): string | null {

  if (!url) return null;
  url = url.trim();

  try {

    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const parsed = new URL(url);

    if (!parsed.hostname.includes("spotify.com")) {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    const types = ["artist", "track", "album"];

    for (const type of types) {

      const index = parts.indexOf(type);

      if (index !== -1) {

        const id = parts[index + 1]?.split("?")[0];

        if (/^[A-Za-z0-9]{22}$/.test(id)) {
          return id;
        }

      }

    }

    return null;

  } catch {

    return null;

  }

}



/* ======================================================
   APPLE MUSIC
====================================================== */

export function extractAppleMusicId(url: string): string | null {
  if (!url) return null;
  url = url.trim();

  try {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    console.log(`[DEBUG] Analizando URL Apple: ${url}`);
    const parsed = new URL(url);
    console.log(`[DEBUG] Hostname: ${parsed.hostname}`);

    if (!parsed.hostname.includes("apple.com")) {
      console.log(`[DEBUG] Fallo: Hostname no válido`);
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    console.log(`[DEBUG] Parts (split): ${JSON.stringify(parts)}`);
    
    // Buscamos cualquier segmento que sea puramente numérico o empiece por 'id'
    for (const part of [...parts].reverse()) {
      const cleanId = part.startsWith("id") ? part.slice(2) : part;
      console.log(`[DEBUG] Evaluando parte: ${part} -> Clean: ${cleanId}`);
      if (/^\d+$/.test(cleanId)) {
        console.log(`[DEBUG] ¡ID ENCONTRADO!: ${cleanId}`);
        return cleanId;
      }
    }

    console.log(`[DEBUG] Fallo: No se encontró ID numérico en la ruta`);
    return null;
  } catch {
    return null;
  }
}

/* ======================================================
   YOUTUBE
====================================================== */

export function extractYoutubeChannelId(url: string): string | null {
  if (!url) return null;

  try {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const parsed = new URL(url);

    if (!parsed.hostname.includes("youtube.com")) {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts[0] === "channel") {
      return parts[1];
    }

    if (parts[0].startsWith("@")) {
      return parts[0].replace("@", "");
    }

    if (parts[0] === "c" || parts[0] === "user") {
      return parts[1];
    }

    return null;
  } catch {
    return null;
  }
}

/* ======================================================
   INSTAGRAM
====================================================== */

export function extractInstagramUsername(url: string): string | null {
  if (!url) return null;

  try {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const parsed = new URL(url);

    if (!parsed.hostname.includes("instagram.com")) {
      return null;
    }

    const username = parsed.pathname
      .replace(/^\/+|\/+$/g, "")   // quita / inicial y final
      .split("/")[0];

    if (!username) return null;

    return username;

  } catch {
    return null;
  }
}

/* ======================================================
   TIKTOK
====================================================== */

export function extractTikTokUsername(url: string): string | null {
  if (!url) return null;

  try {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const parsed = new URL(url);

    if (!parsed.hostname.includes("tiktok.com")) {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts[0].startsWith("@")) {
      return parts[0].replace("@", "");
    }

    return null;
  } catch {
    return null;
  }
}