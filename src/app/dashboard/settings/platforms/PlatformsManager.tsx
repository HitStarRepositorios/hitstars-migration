"use client";

import { useState, useEffect, useRef } from "react";
import { savePlatformsAction } from "@/app/actions/artist";
import { Platform } from "@prisma/client";

type ExistingPlatform = {
  platform: Platform;
  url: string | null;
  isPrimary: boolean;
};

const PLATFORMS: {
  key: Platform;
  label: string;
  logo: string;
}[] = [
  { key: Platform.SPOTIFY, label: "Spotify", logo: "/logos/spotify.png" },
  { key: Platform.APPLE_MUSIC, label: "Apple Music", logo: "/logos/applemusic.svg" },
  { key: Platform.YOUTUBE, label: "YouTube Music", logo: "/logos/youtubemusic.png" },
  { key: Platform.TIKTOK, label: "TikTok", logo: "/logos/tiktok.png" },
  { key: Platform.INSTAGRAM, label: "Instagram", logo: "/logos/instagram.png" },
  { key: Platform.SOUNDCLOUD, label: "SoundCloud", logo: "/logos/soundcloud.png" },
  { key: Platform.AMAZON, label: "Amazon Music", logo: "/logos/amazonmusic.png" },
];



export default function PlatformsManager({


  
  existingPlatforms,
}: {
  existingPlatforms: ExistingPlatform[];
}) {
    const [spotifyPreview, setSpotifyPreview] = useState<any>(null);
const [spotifyLoading, setSpotifyLoading] = useState(false);
const lastSpotifyCheck = useRef<string | null>(null);
const [applePreview, setApplePreview] = useState<any>(null);
const [appleLoading, setAppleLoading] = useState(false);
const [youtubePreview, setYoutubePreview] = useState<any>(null);
const [youtubeLoading, setYoutubeLoading] = useState(false);
const [tiktokPreview, setTiktokPreview] = useState<any>(null);
const [tiktokLoading, setTiktokLoading] = useState(false);
const [instagramPreview, setInstagramPreview] = useState<any>(null);
const [instagramLoading, setInstagramLoading] = useState(false);
const [soundcloudPreview, setSoundcloudPreview] = useState<any>(null);
const [amazonPreview, setAmazonPreview] = useState<any>(null);
  const [selected, setSelected] = useState<Platform[]>(
    existingPlatforms.map((p) => p.platform)
  );

const [urls, setUrls] = useState<Record<Platform, string>>(() => {

  const base: Partial<Record<Platform, string>> = {
    SPOTIFY: "",
    APPLE_MUSIC: "",
    YOUTUBE: "",
    TIKTOK: "",
    INSTAGRAM: "",
    SOUNDCLOUD: "",
    AMAZON: ""
  };

  for (const p of existingPlatforms) {
    base[p.platform] = p.url || "";
  }

  return base as Record<Platform, string>;

});

  const [primary, setPrimary] = useState<Platform | null>(
    existingPlatforms.find((p) => p.isPrimary)?.platform || null
  );

  const togglePlatform = (key: Platform) => {
    setSelected((prev) =>
      prev.includes(key)
        ? prev.filter((p) => p !== key)
        : [...prev, key]
    );
  };
useEffect(() => {

  const spotifyUrl = urls[Platform.SPOTIFY];
  const appleUrl = urls[Platform.APPLE_MUSIC];
  const youtubeUrl = urls[Platform.YOUTUBE];
  const tiktokUrl = urls[Platform.TIKTOK];
  const instagramUrl = urls[Platform.INSTAGRAM];
  const soundcloudUrl = urls[Platform.SOUNDCLOUD];
  const amazonUrl = urls[Platform.AMAZON];

  const timeout = setTimeout(() => {

if (
  spotifyUrl &&
  spotifyUrl.includes("/artist/") &&
  spotifyUrl !== lastSpotifyCheck.current
) {
  lastSpotifyCheck.current = spotifyUrl;
  verifySpotify(spotifyUrl);
}
    if (appleUrl && appleUrl.includes("music.apple.com")) {
      verifyApple(appleUrl);
    }

    if (youtubeUrl && youtubeUrl.includes("youtube.com")) {
      verifyYoutube(youtubeUrl);
    }

    if (tiktokUrl && tiktokUrl.includes("tiktok.com")) {
      verifyTikTok(tiktokUrl);
    }

    if (instagramUrl && instagramUrl.includes("instagram.com")) {
      verifyInstagram(instagramUrl);
    }

    if (soundcloudUrl && soundcloudUrl.includes("soundcloud.com")) {
      verifySoundcloud(soundcloudUrl);
    }

    if (amazonUrl && amazonUrl.includes("amazon.com")) {
      verifyAmazon(amazonUrl);
    }

  }, 600);

  return () => clearTimeout(timeout);

}, [
  urls[Platform.SPOTIFY],
  urls[Platform.APPLE_MUSIC],
  urls[Platform.YOUTUBE],
  urls[Platform.TIKTOK],
  urls[Platform.INSTAGRAM],
  urls[Platform.SOUNDCLOUD],
  urls[Platform.AMAZON]
]);

async function verifySpotify(url: string) {

  const isSpotifyArtist = /spotify\.com\/.*artist\//.test(url);
  if (!isSpotifyArtist) return;

  setSpotifyLoading(true);

  const res = await fetch("/api/platform/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "SPOTIFY",
      url,
    }),
  });

  let data;

  try {
    data = await res.json();
  } catch (err) {
    console.log("Verify API returned non JSON");
    setSpotifyLoading(false);
    return;
  }

  if (data.valid) {
    setSpotifyPreview(data);
  } else {
    setSpotifyPreview(null);
  }

  setSpotifyLoading(false);
}

async function verifyApple(url: string) {

  if (!url.includes("music.apple.com")) return;

  setAppleLoading(true);

  const res = await fetch("/api/platform/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "APPLE_MUSIC",
      url,
    }),
  });

  const data = await res.json();


  if (data.valid) {
    setApplePreview(data.metadata);
  } else {
    setApplePreview(null);
  }

  setAppleLoading(false);
}

async function verifyYoutube(url: string) {

  if (!url.includes("youtube.com")) return;

  setYoutubeLoading(true);

  const res = await fetch("/api/platform/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "YOUTUBE",
      url,
    }),
  });

  const data = await res.json();


  if (data.valid) {
    setYoutubePreview(data);   // 👈 ESTA LÍNEA ES LA CLAVE
  } else {
    setYoutubePreview(null);
  }

  setYoutubeLoading(false);
}

async function verifyTikTok(url: string) {

  if (!url.includes("tiktok.com")) return;

  setTiktokLoading(true);

  const res = await fetch("/api/platform/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "TIKTOK",
      url,
    }),
  });

  const data = await res.json();


  if (data.valid) {
    setTiktokPreview(data);
  } else {
    setTiktokPreview(null);
  }

  setTiktokLoading(false);
}

async function verifyInstagram(url: string) {

  if (!url.includes("instagram.com")) return;

  setInstagramLoading(true);

  const res = await fetch("/api/platform/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "INSTAGRAM",
      url,
    }),
  });

  let data;

  try {
    data = await res.json();
  } catch {
    console.log("Instagram rate limited");
    setInstagramLoading(false);
    return;
  }


  if (data.valid) {
    setInstagramPreview(data);
  } else {
    setInstagramPreview(null);
  }

  setInstagramLoading(false);
}

async function verifySoundcloud(url: string) {

  if (!url.includes("soundcloud.com")) return;

  const res = await fetch("/api/platform/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "SOUNDCLOUD",
      url,
    }),
  });

  const data = await res.json();

  if (data.valid) {
    setSoundcloudPreview(data);
  } else {
    setSoundcloudPreview(null);
  }

}

async function verifyAmazon(url: string) {

  if (!url.includes("music.amazon")) return;

  const res = await fetch("/api/platform/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: "AMAZON",
      url,
    }),
  });

  const data = await res.json();

  if (data.valid) {
    setAmazonPreview(data);
  } else {
    setAmazonPreview(null);
  }

}

async function handleSave() {

  for (const platform of selected) {

    const url = urls[platform];
    if (!url) continue;

    const res = await fetch("/api/platform/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform,
        url,
      }),
    });

    const data = await res.json();

    console.log("VERIFY RESPONSE:", data);

if (!data.valid && !data.rateLimited) {
  alert(`URL inválida para ${platform}`);
  return;
    }
  }

  const formattedPlatforms = selected
    .filter((platform) => urls[platform])
    .map((platform) => ({
      platform,
      url: urls[platform],
      isPrimary: primary === platform,
    }));

  await savePlatformsAction({ platforms: formattedPlatforms });

  alert("Plataformas actualizadas");
}


  return (
    <div className="glass-panel" style={{ maxWidth: 900, margin: "4rem auto" }}>
      <h2 className="mb-lg">Conectar Plataformas</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {PLATFORMS.map((platform) => {
          const active = selected.includes(platform.key);

          return (
            <div
              key={platform.key}
              onClick={() => togglePlatform(platform.key)}
              style={{
                padding: "1.5rem",
                borderRadius: "18px",
                border: active
                  ? "1px solid rgba(139,92,246,0.6)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: active
                  ? "rgba(139,92,246,0.08)"
                  : "rgba(255,255,255,0.02)",
                transition: "all 0.25s ease",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <img
                  src={platform.logo}
                  alt={platform.label}
                  style={{ width: 32, height: 32 }}
                />

                <h4 style={{ margin: 0 }}>{platform.label}</h4>

                {primary === platform.key && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.7rem",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg,#7c3aed,#ec4899)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    PRINCIPAL
                  </span>
                )}
              </div>

              {active && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
  type="url"
  placeholder={`URL de ${platform.label}`}
  className="form-input"
  value={urls[platform.key] || ""}
onChange={(e) => {

  const value = e.target.value;

  setUrls((prev) => ({
    ...prev,
    [platform.key]: value,
  }));

}}
/>

                  {platform.key === Platform.SPOTIFY && spotifyPreview && (

  <div
    style={{
      marginTop: "14px",
      padding: "16px",
      borderRadius: "16px",
      background: "linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}
  >

    {/* Artist Header */}
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

      <img
        src={spotifyPreview.image}
        alt={spotifyPreview.name}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0 6px 20px rgba(0,0,0,0.5)"
        }}
      />

      <div>

        <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>
          {spotifyPreview.name}
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            opacity: 0.7
          }}
        >
          Artista detectado en Spotify
        </div>

      </div>

    </div>

    {/* Stats */}
    <div
      style={{
        display: "flex",
        gap: "18px",
        fontSize: "0.75rem",
        opacity: 0.75
      }}
    >

      <div>
        Popularidad: <strong>{spotifyPreview.popularity}</strong>
      </div>

      {spotifyPreview.followers > 0 && (
        <div>
          Followers: <strong>{spotifyPreview.followers}</strong>
        </div>
      )}

    </div>

    {/* Tracks preview */}
    {spotifyPreview.tracksSample?.length > 0 && (

      <div
        style={{
          fontSize: "0.75rem",
          opacity: 0.7
        }}
      >

        Canciones detectadas:

        <div
          style={{
            marginTop: "4px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px"
          }}
        >

          {spotifyPreview.tracksSample.map((track: any, i: number) => (

            <span
              key={i}
              style={{
                padding: "4px 8px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.06)"
              }}
            >
              {track.name}
            </span>

          ))}

        </div>

      </div>

    )}

  </div>

)}


{/* APPLE PREVIEW */}
{platform.key === Platform.APPLE_MUSIC && applePreview && (

  <div
    style={{
      marginTop: "14px",
      padding: "16px",
      borderRadius: "16px",
      background: "linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      gap: "14px"
    }}
  >

    <img
      src={applePreview.image}
      alt={applePreview.name}
      style={{
        width: 64,
        height: 64,
        borderRadius: "12px",
        objectFit: "cover"
      }}
    />

    <div>

      <div style={{ fontWeight: 600 }}>
        {applePreview.name}
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          opacity: 0.7
        }}
      >
        Artista detectado en Apple Music
      </div>

    </div>

  </div>

)}


{platform.key === Platform.YOUTUBE && youtubePreview && (

  <div style={{
    marginTop: "14px",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  }}>

    <img
      src={youtubePreview.image}
      alt={youtubePreview.name}
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        objectFit: "cover"
      }}
    />

    <div>
      <div style={{ fontWeight: 600 }}>
        {youtubePreview.name}
      </div>

      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
        Canal detectado en YouTube
      </div>
    </div>

  </div>

)}


{platform.key === Platform.TIKTOK && tiktokPreview && (

  <div style={{
    marginTop: "14px",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  }}>

    <img
      src={tiktokPreview.image}
      alt={tiktokPreview.name}
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        objectFit: "cover"
      }}
    />

    <div>
      <div style={{ fontWeight: 600 }}>
        {tiktokPreview.name}
      </div>

      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
        Perfil detectado en TikTok
      </div>
    </div>

  </div>

)}

{platform.key === Platform.INSTAGRAM && instagramPreview && (

  <div style={{
    marginTop: "14px",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  }}>

    <img
      src={instagramPreview.image}
      alt={instagramPreview.name}
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        objectFit: "cover"
      }}
    />

    <div>
      <div style={{ fontWeight: 600 }}>
        {instagramPreview.name}
      </div>

      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
        Perfil detectado en Instagram
      </div>
    </div>

  </div>

)}

{platform.key === Platform.SOUNDCLOUD && soundcloudPreview && (

  <div style={{
    marginTop: "14px",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  }}>

    <img
      src={soundcloudPreview.image}
      alt={soundcloudPreview.name}
      style={{
        width: 64,
        height: 64,
        borderRadius: "12px",
        objectFit: "cover"
      }}
    />

    <div>
      <div style={{ fontWeight: 600 }}>
        {soundcloudPreview.name}
      </div>

      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
        Perfil detectado en SoundCloud
      </div>
    </div>

  </div>

)}

{platform.key === Platform.AMAZON && amazonPreview && (

  <div style={{
    marginTop: "14px",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  }}>

    <img
      src={amazonPreview.image}
      alt={amazonPreview.name}
      style={{
        width: 64,
        height: 64,
        borderRadius: "12px",
        objectFit: "cover"
      }}
    />

    <div>
      <div style={{ fontWeight: 600 }}>
        {amazonPreview.name}
      </div>

      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
        Artista detectado en Amazon Music
      </div>
    </div>

  </div>

)}


                  <button
                    type="button"
                    onClick={() => setPrimary(platform.key)}
                    className="btn btn-secondary"
                    style={{ width: "fit-content", fontSize: "0.8rem" }}
                  >
                    Marcar como principal
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "2.5rem" }}>
        <button onClick={handleSave} className="btn btn-primary btn-block">
          Guardar cambios
        </button>
      </div>
    </div>
  );
}


