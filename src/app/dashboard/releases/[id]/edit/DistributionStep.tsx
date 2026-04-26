"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import InteractiveWorldMap from "@/components/InteractiveWorldMap";
import { Platform } from "@prisma/client";
import { ALL_COUNTRIES, REGIONS, TERRITORY_NAMES } from "@/lib/territories";

interface Props {
  release: any;
}

const PLATFORMS: {
  id: Platform
  label: string
  logo: string
}[] = [
  { id: "SPOTIFY", label: "Spotify", logo: "/logos/spotify.png" },
  { id: "APPLE_MUSIC", label: "Apple Music", logo: "/logos/applemusic.svg" },
  { id: "AMAZON", label: "Amazon Music", logo: "/logos/amazonmusic.png" },
  { id: "DEEZER", label: "Deezer", logo: "/logos/deezer.png" },
  { id: "YOUTUBE_MUSIC", label: "YouTube Music", logo: "/logos/youtubemusic.png" },
  { id: "TIKTOK", label: "TikTok", logo: "/logos/tiktok.png" },
  { id: "INSTAGRAM", label: "Instagram Music", logo: "/logos/instagram.png" },
  { id: "BEATPORT", label: "Beatport", logo: "/logos/beatport.png" },
  { id: "SHAZAM", label: "Shazam", logo: "/logos/shazam.png" },
  { id: "VEVO", label: "VEVO", logo: "/logos/vevo.png" },
  { id: "TIDAL", label: "TIDAL", logo: "/logos/tidal.png" },
  { id: "PANDORA", label: "Pandora", logo: "/logos/pandora.png" },
  { id: "NAPSTER", label: "Napster", logo: "/logos/napster.png" },
  { id: "ANGHAMI", label: "Anghami", logo: "/logos/anghami.jpeg" },
  { id: "BOOMPLAY", label: "Boomplay", logo: "/logos/boomplay.png" },
  { id: "SOUNDCLOUD", label: "SoundCloud", logo: "/logos/soundcloud.png" },

  { id: "TENCENT", label: "Tencent Music", logo: "/logos/tencent.svg" },
  { id: "NETEASE", label: "NetEase Cloud Music", logo: "/logos/netease.png" },
  { id: "QQ_MUSIC", label: "QQ Music", logo: "/logos/qqmusic.svg" },
  { id: "KUGOU", label: "KuGou", logo: "/logos/kugou.png" },
  { id: "KUWO", label: "KuWo", logo: "/logos/kuwo.png" },
  { id: "GAANA", label: "Gaana", logo: "/logos/gaana.webp" },
  { id: "JIOSAAVN", label: "JioSaavn", logo: "/logos/jiosaavn.webp" },
  { id: "AUDIOMACK", label: "Audiomack", logo: "/logos/audiomack.png" },
  { id: "SNAPCHAT", label: "Snapchat Sounds", logo: "/logos/snapchat.jpg" },
  { id: "FACEBOOK", label: "Facebook Music", logo: "/logos/facebook.png" },
  { id: "RESSO", label: "Resso", logo: "/logos/resso.webp" },
  { id: "CAPCUT", label: "CapCut Library", logo: "/logos/capcut.png" },
  { id: "TRAXSOURCE", label: "Traxsource", logo: "/logos/traxsource.png" }
];

const CONTINENT_BUTTONS = [
  { id: "EUROPE", label: "Europa" },
  { id: "LATAM", label: "América Latina" },
  { id: "NORTH_AMERICA", label: "Norteamérica" },
  { id: "ASIA", label: "Asia" },
  { id: "AFRICA", label: "África" },
  { id: "OCEANIA", label: "Oceanía" },
  { id: "RUSSIA", label: "Rusia" }
];

export default function DistributionStep({ release }: Props) {
  const router = useRouter();

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    release.distributionPlatforms || []
  );

  const [selectedTerritories, setSelectedTerritories] = useState<string[]>(() => {
    const initial = release.distributionTerritories || [];
    const normalized = new Set<string>();
    initial.forEach((t: string) => {
      if (REGIONS[t as keyof typeof REGIONS]) {
        REGIONS[t as keyof typeof REGIONS].forEach((id: string) => normalized.add(id));
      } else {
        normalized.add(t);
      }
    });
    return Array.from(normalized);
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState(false);

  /* ==========================================
     TOGGLES
  ========================================== */

  const toggleTerritory = useCallback((id: string) => {
    setTouched(true);
    setSelectedTerritories((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id]
    );
  }, []);

  const toggleRegion = useCallback((regionId: string) => {
    setTouched(true);
    const regionCountries = REGIONS[regionId as keyof typeof REGIONS] || [];
    
    setSelectedTerritories((prev) => {
      // Si todos los países de la región ya están seleccionados, los quitamos
      const allSelected = regionCountries.every(id => prev.includes(id));
      
      if (allSelected) {
        return prev.filter(id => !regionCountries.includes(id));
      } else {
        // Añadimos los que falten
        const newSelected = new Set(prev);
        regionCountries.forEach(id => newSelected.add(id));
        return Array.from(newSelected);
      }
    });
  }, []);

  const togglePlatform = useCallback((id: Platform) => {
    setTouched(true);
    setSelectedPlatforms((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  }, []);

  function isValid() {
    if (selectedPlatforms.length === 0) return false;
    if (selectedTerritories.length === 0) return false;
    return true;
  }

  /* ==========================================
     SAVE
  ========================================== */

  async function handleSave() {
    setTouched(true);

    if (!isValid()) return;

    setLoading(true);
    setSaved(false);

    try {
      await fetch("/api/distribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          releaseId: release.id,
          distribution: {
            platforms: selectedPlatforms,
            territories: selectedTerritories,
            worldwide: selectedTerritories.length >= ALL_COUNTRIES.length,
          },
        }),
      });

      router.refresh();
      setSaved(true);
    } catch (error) {
      console.error("Error guardando distribución:", error);
    }

    setLoading(false);
  }

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="flex-col gap-lg">

      {/* PLATFORMS */}
      <div>
        <h3>Tiendas y plataformas</h3>
        <p className="text-muted mb-md">
          Selecciona dónde quieres distribuir tu lanzamiento.
        </p>

        <div style={{ marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => {
              setTouched(true);
              if (selectedPlatforms.length === PLATFORMS.length) {
                setSelectedPlatforms([]);
              } else {
                setSelectedPlatforms(PLATFORMS.map((p) => p.id));
              }
            }}
            className="btn btn-secondary"
          >
            {selectedPlatforms.length === PLATFORMS.length
              ? "Deseleccionar todas"
              : "Seleccionar todas"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {PLATFORMS.map((platform) => {
            const active = selectedPlatforms.includes(platform.id);

            return (
              <div
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                style={{
                  padding: "0.9rem 1rem",
                  borderRadius: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  minHeight: "60px",
                  background: active
                    ? "linear-gradient(135deg,#6d28d9,#db2777)"
                    : "rgba(255,255,255,0.05)",
                  transition: "all 0.2s ease",
                }}
              >
                <img
                  src={platform.logo}
                  alt={platform.label}
                  style={{
                    width: "22px",
                    height: "22px",
                    objectFit: "contain",
                  }}
                />
                <span style={{ fontWeight: 600 }}>
                  {platform.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TERRITORIES */}
      <div style={{ marginTop: "4rem" }}>
        <h3>Alcance de distribución</h3>

        <label style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
          <input
            type="checkbox"
            checked={
              selectedTerritories.length >= ALL_COUNTRIES.length
            }
            onChange={(e) => {
              setTouched(true);
              if (e.target.checked) {
                setSelectedTerritories(ALL_COUNTRIES);
              } else {
                setSelectedTerritories([]);
              }
            }}
          />
          Distribución mundial ({ALL_COUNTRIES.length} países)
        </label>

        {/* CONTROLES POR CONTINENTE */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          {CONTINENT_BUTTONS.map((btn) => {
            const regionCountries = REGIONS[btn.id as keyof typeof REGIONS] || [];
            const allSelected = regionCountries.every(id => selectedTerritories.includes(id));
            
            return (
              <button
                key={btn.id}
                onClick={() => toggleRegion(btn.id)}
                className={`btn ${allSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
              >
                {btn.label} {allSelected && "✓"}
              </button>
            );
          })}
        </div>

        <InteractiveWorldMap
          selectedTerritories={selectedTerritories}
          toggleTerritory={toggleTerritory}
          worldwide={selectedTerritories.length >= ALL_COUNTRIES.length}
        />

        {/* LISTA COMPACTA DE PAÍSES SELECCIONADOS */}
        {selectedTerritories.length > 0 && selectedTerritories.length < ALL_COUNTRIES.length && (
          <div style={{ marginTop: "1.5rem" }}>
            <p className="text-sm text-muted mb-2">Países seleccionados ({selectedTerritories.length}):</p>
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "4px", 
              maxHeight: "120px", 
              overflowY: "auto",
              padding: "0.5rem",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px"
            }}>
              {selectedTerritories.map(id => (
                <span key={id} style={{ 
                  fontSize: "0.75rem", 
                  padding: "2px 8px", 
                  background: "rgba(139, 92, 246, 0.2)", 
                  color: "#c4b5fd",
                  borderRadius: "12px"
                }}>
                  {TERRITORY_NAMES[id] || id}
                  <button 
                    onClick={() => toggleTerritory(id)}
                    style={{ background: "none", border: "none", color: "inherit", marginLeft: "4px", cursor: "pointer", fontSize: "0.7rem", padding: 0 }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {touched && !isValid() && (
          <p style={{ color: "#f87171", marginTop: "1.5rem" }}>
            Debes seleccionar al menos una plataforma y al menos un territorio.
          </p>
        )}
      </div>

      {/* SAVE */}
      <div className="flex gap-md mt-lg">
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Guardando..." : "Guardar distribución"}
        </button>

        {saved && (
          <span style={{ color: "#4ade80", alignSelf: "center" }}>
            ✓ Guardado correctamente
          </span>
        )}
      </div>
    </div>
  );
}