"use client";

import { useState } from "react";

interface Props {
  release: any;
  selectedPlatforms: string[];
  selectedTerritories: string[];
  creditsValid: boolean;
  hasCover: boolean;
  hasTracks: boolean;
  submitAction: (formData: FormData) => void;
}

const ALL_REGIONS = [
  "EUROPE",
  "LATAM",
  "NORTH_AMERICA",
  "ASIA",
  "AFRICA",
  "OCEANIA",
];

export default function ReviewStep({
  release,
  selectedPlatforms,
  selectedTerritories,
  creditsValid,
  hasCover,
  hasTracks,
  submitAction,
}: Props) {
  const [confirm, setConfirm] = useState(false);

  const isWorldwide =
    selectedTerritories.length === ALL_REGIONS.length;

const tracksWithoutPublishing = release.tracks.filter((track: any) => {
  const publishingCredits = track.publishingCredits || [];

  const validPublishing = publishingCredits.filter(
    (p: any) => Number(p.share) > 0
  );

  return validPublishing.length === 0;
});

const tracksWithoutLyrics = release.tracks.filter((track: any) => {
  if (track.isInstrumental) return false;

  return !track.lyrics || track.lyrics.trim() === "";
});

  const errors: string[] = [];

  if (selectedPlatforms.length === 0)
    errors.push("Selecciona al menos una plataforma.");

  if (selectedTerritories.length === 0)
    errors.push("Selecciona al menos un territorio.");

  if (!hasCover)
    errors.push("Debes subir una portada.");

  if (!hasTracks)
    errors.push("Debes añadir al menos un track.");

  if (!creditsValid)
    errors.push("Los créditos no suman 100% o están incompletos.");

  const canSubmit =
    errors.length === 0 && confirm;

  return (
    <div className="flex-col gap-lg">
      <h3>Revisión final</h3>

      {/* 🔹 Resumen general */}
      <div className="card">
        <h4>{release.title}</h4>
        <p>Tipo: {release.distributionType}</p>
        <p>
          Fecha lanzamiento:{" "}
          {release.releaseDate
            ? new Date(release.releaseDate).toLocaleDateString("es-ES")
            : "No definida"}
        </p>
        <p>Estado: {release.status}</p>
      </div>

      {/* 🔹 Portada */}
      <div className="card">
        <h4>Portada</h4>
        {hasCover ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img
              src={release.coverUrl}
              alt="Cover"
              style={{
                width: "120px",
                borderRadius: "12px",
              }}
            />
            <span style={{ color: "#4ade80" }}>
              ✔ Portada subida
            </span>
          </div>
        ) : (
          <span style={{ color: "#f87171" }}>
            ✖ No hay portada
          </span>
        )}
      </div>

      {/* 🔹 Tracks */}
      <div className="card">
        <h4>Tracks</h4>
        {hasTracks ? (
          <div>
            <span style={{ color: "#4ade80", marginTop: "2rem" }}>
              ✔ {release.tracks.length} track(s)
            </span>

            <ul style={{ marginTop: "0.8rem", opacity: 0.8 }}>
              {release.tracks.map((track: any) => (
                <li key={track.id}>
                  {track.title}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <span style={{ color: "#f87171" }}>
            ✖ No hay tracks
          </span>
        )}
      </div>

      {/* 🔹 Plataformas */}
      <div className="card">
        <h4>Plataformas</h4>
        <p>{selectedPlatforms.length} seleccionadas</p>
        <p style={{ opacity: 0.7 }}>
          {selectedPlatforms.join(", ")}
        </p>
      </div>

      {/* 🔹 Territorios */}
      <div className="card">
        <h4>Territorios</h4>
        <p>
          {isWorldwide
            ? "🌍 Distribución mundial"
            : selectedTerritories.join(", ")}
        </p>
      </div>

      {/* 🔹 Créditos */}
      <div className="card">
        <h4>Créditos</h4>
        {creditsValid ? (
          <span style={{ color: "#4ade80" }}>
            ✔ Todos los splits suman 100%
          </span>
        ) : (
          <span style={{ color: "#f87171" }}>
            ✖ Hay splits incorrectos
          </span>
        )}
      </div>

{/* 🔹 Avisos adicionales */}
{(tracksWithoutPublishing.length > 0 ||
  tracksWithoutLyrics.length > 0) && (
  <div
    style={{
      background: "rgba(59,130,246,0.08)",
      border: "1px solid rgba(59,130,246,0.4)",
      padding: "1.2rem 1.5rem",
      borderRadius: "16px",
      marginTop: "2rem",
    }}
  >
    <strong style={{ color: "#3b82f6" }}>
      ℹ Avisos importantes:
    </strong>

    <div style={{ marginTop: "0.8rem" }}>
      {tracksWithoutPublishing.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={{ color: "#3b82f6" }}>
            Sin publishing configurado:
          </strong>

          <ul
            style={{
              marginTop: "0.5rem",
              paddingLeft: "1.5rem",
            }}
          >
            {tracksWithoutPublishing.map((track: any) => (
              <li key={track.id} style={{ marginBottom: "0.3rem" }}>
                {track.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tracksWithoutLyrics.length > 0 && (
        <div>
          <strong style={{ color: "#3b82f6" }}>
            Sin letras:
          </strong>

          <ul
            style={{
              marginTop: "0.5rem",
              paddingLeft: "1.5rem",
            }}
          >
            {tracksWithoutLyrics.map((track: any) => (
              <li key={track.id} style={{ marginBottom: "0.3rem" }}>
                {track.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
)}

      {/* 🔹 Errores */}
{errors.length > 0 && (
  <div
    style={{
      background: "rgba(248,113,113,0.08)",
      border: "1px solid rgba(248,113,113,0.4)",
      padding: "1.25rem 1.5rem",
      borderRadius: "16px",
      marginTop: "1.5rem",
    }}
  >
    <strong style={{ display: "block", marginBottom: "0.75rem" }}>
      ⚠ Antes de enviar:
    </strong>

    <ul
      style={{
        margin: 0,
        paddingLeft: "1.2rem",
        listStylePosition: "inside",
        lineHeight: 1.6,
      }}
    >
      {errors.map((err, i) => (
        <li key={i} style={{ marginBottom: "0.4rem" }}>
          {err}
        </li>
      ))}
    </ul>
  </div>
)}

      <label style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
  <input
    type="checkbox"
    checked={confirm}
    onChange={(e) => setConfirm(e.target.checked)}
  />
  Confirmo que soy titular de los derechos y que la información proporcionada es correcta.
</label>

      {/* 🔥 FORM SERVER ACTION */}
      <form action={submitAction}>
        <input type="hidden" name="releaseId" value={release.id} />

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn btn-primary"
          style={{
            marginTop: "2rem",
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          Enviar a distribución
        </button>
      </form>
    </div>
  );
}