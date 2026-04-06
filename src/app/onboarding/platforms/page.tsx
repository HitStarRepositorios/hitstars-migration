"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePlatformsAction } from "@/app/actions/artist";
import { Platform } from "@prisma/client";

const PLATFORMS = [
  { key: "SPOTIFY", label: "Spotify", logo: "/logos/spotify.png" },
  { key: "APPLE_MUSIC", label: "Apple Music", logo: "/logos/applemusic.svg" },
  { key: "YOUTUBE", label: "YouTube Music", logo: "/logos/youtubemusic.png" },
  { key: "TIKTOK", label: "TikTok", logo: "/logos/tiktok.png" },
  { key: "INSTAGRAM", label: "Instagram", logo: "/logos/instagram.png" },
  { key: "SOUNDCLOUD", label: "SoundCloud", logo: "/logos/soundcloud.png" },
  { key: "AMAZON", label: "Amazon Music", logo: "/logos/amazonmusic.png" },
];

export default function PlatformsStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [primary, setPrimary] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const togglePlatform = (key: string) => {
    setSelected((prev) =>
      prev.includes(key)
        ? prev.filter((p) => p !== key)
        : [...prev, key]
    );
  };

async function handleSubmit() {
  setLoading(true);
  setError(null);

  try {
    const formattedPlatforms = selected
      .filter((platform) => urls[platform])
      .map((platform) => ({
        platform: platform as Platform,
        url: urls[platform],
        isPrimary: primary === platform,
      }));

    const result = await savePlatformsAction({
      platforms: formattedPlatforms,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  } catch (err) {
    setError("Ocurrió un error inesperado.");
  } finally {
    setLoading(false);
  }
}



  return (
    <div className="glass-panel" style={{ maxWidth: 900, margin: "4rem auto" }}>
      <h2 className="mb-lg">Plataformas</h2>

      <p className="text-muted mb-xl">
        Conecta tus perfiles existentes. Puedes añadirlos más tarde.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
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
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <img
                  src={platform.logo}
                  alt={platform.label}
                  style={{
                    width: 32,
                    height: 32,
                    objectFit: "contain",
                  }}
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

              {/* INPUT */}
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
                    onChange={(e) =>
                      setUrls((prev) => ({
                        ...prev,
                        [platform.key]: e.target.value,
                      }))
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setPrimary(platform.key)}
                    className="btn btn-secondary"
                    style={{
                      width: "fit-content",
                      fontSize: "0.8rem",
                    }}
                  >
                    Marcar como principal
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-center mt-md" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: "2.5rem" }}>
        <button 
          onClick={handleSubmit} 
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Finalizar onboarding"}
        </button>
      </div>
    </div>
  );
}