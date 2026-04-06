"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePlatformsAction } from "@/app/actions/artist";
import { Platform } from "@prisma/client";

const PLATFORMS: { key: Platform; label: string; logo: string }[] = [
  { key: "SPOTIFY", label: "Spotify", logo: "/logos/spotify.png" },
  { key: "APPLE", label: "Apple Music", logo: "/logos/applemusic.svg" },
  { key: "YOUTUBE", label: "YouTube Music", logo: "/logos/youtubemusic.png" },
  { key: "TIKTOK", label: "TikTok", logo: "/logos/tiktok.png" },
  { key: "INSTAGRAM", label: "Instagram", logo: "/logos/instagram.png" },
  { key: "SOUNDCLOUD", label: "SoundCloud", logo: "/logos/soundcloud.png" },
  { key: "AMAZON", label: "Amazon Music", logo: "/logos/amazonmusic.png" },
];

export default function PlatformsStep() {

  const router = useRouter();

  const [selected, setSelected] = useState<Platform[]>([]);
  const [primary, setPrimary] = useState<Platform | null>(null);

  const [urls, setUrls] = useState<Record<string, string>>({});
  const [verification, setVerification] = useState<Record<string, any>>({});
  const [loadingVerification, setLoadingVerification] = useState<Record<string, boolean>>({});

  const togglePlatform = (key: Platform) => {
    setSelected(prev =>
      prev.includes(key)
        ? prev.filter(p => p !== key)
        : [...prev, key]
    );
  };

  async function handleSubmit() {

    const formattedPlatforms = selected
      .filter(platform => urls[platform])
      .map(platform => ({
        platform,
        url: urls[platform],
        isPrimary: primary === platform,
      }));

    await savePlatformsAction({
      platforms: formattedPlatforms,
    });

    router.refresh();
  }

  async function verifyPlatform(platform: Platform, value: string) {

    if (!value.includes(".")) return;

    setLoadingVerification(prev => ({
      ...prev,
      [platform]: true,
    }));

    try {

      const res = await fetch("/api/platform/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          url: value,
        }),
      });

      const data = await res.json();

      setVerification(prev => ({
        ...prev,
        [platform]: data,
      }));

    } catch (err) {
      console.error(err);
    }

    setLoadingVerification(prev => ({
      ...prev,
      [platform]: false,
    }));
  }

  return (
    <div className="glass-panel" style={{ maxWidth: 900, margin: "4rem auto" }}>

      <h2 className="mb-lg">Plataformas</h2>

      <p className="text-muted mb-xl">
        Conecta tus perfiles existentes. Puedes añadirlos más tarde.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {PLATFORMS.map(platform => {

          const active = selected.includes(platform.key);

          return (

            <div
              key={platform.key}
              style={{
                padding: "1.5rem",
                borderRadius: "18px",
                border: active
                  ? "1px solid rgba(139,92,246,0.6)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: active
                  ? "rgba(139,92,246,0.08)"
                  : "rgba(255,255,255,0.02)",
              }}
            >

              {/* HEADER */}

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

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

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginLeft: "auto", fontSize: "0.75rem" }}
                  onClick={() => togglePlatform(platform.key)}
                >
                  {active ? "Quitar" : "Añadir"}
                </button>

                {primary === platform.key && (
                  <span
                    style={{
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

                <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

                  <input
                    type="url"
                    placeholder={`URL de ${platform.label}`}
                    className="form-input"
                    value={urls[platform.key] || ""}
                    onChange={(e) => {

                      const value = e.target.value.trim();

                      setUrls(prev => ({
                        ...prev,
                        [platform.key]: value,
                      }));

                      verifyPlatform(platform.key, value);
                    }}
                  />

                  {loadingVerification[platform.key] && (
                    <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                      Verificando perfil...
                    </div>
                  )}

                  {verification[platform.key]?.valid && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#10b981",
                      fontSize: "0.85rem",
                    }}>
                      ✓ Perfil verificado

                      {verification[platform.key]?.metadata?.image && (
                        <img
                          src={verification[platform.key].metadata.image}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                          }}
                        />
                      )}

                      {verification[platform.key]?.metadata?.name}
                    </div>
                  )}

                  {verification[platform.key] && !verification[platform.key]?.valid && (
                    <div style={{
                      color: "#ef4444",
                      fontSize: "0.85rem",
                    }}>
                      Perfil no válido
                    </div>
                  )}

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

      <div style={{ marginTop: "2.5rem" }}>
        <button onClick={handleSubmit} className="btn btn-primary btn-block">
          Finalizar onboarding
        </button>
      </div>

    </div>
  );
}