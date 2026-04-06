"use client";

import { useActionState } from "react";
import { useState, useMemo } from "react";
import { updateReleaseInfoAction } from "@/app/actions/releases";
import { GENRES } from "@/lib/genres";
import { LANGUAGES } from "@/lib/languages";

export default function InfoStep({ release }: any) {
  const [state, formAction, pending] = useActionState(
    updateReleaseInfoAction.bind(null, release.id),
    null
  );

  /* ==========================================
     FECHA + HORA
  ========================================== */

  const initialDateTime = release.releaseDate
    ? new Date(release.releaseDate)
    : null;

  const [selectedDate, setSelectedDate] = useState(
    initialDateTime
      ? initialDateTime.toISOString().split("T")[0]
      : ""
  );

  const [selectedTime, setSelectedTime] = useState(
    initialDateTime
      ? initialDateTime.toISOString().split("T")[1]?.slice(0, 5)
      : "00:00"
  );

  const validation = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;

    const chosen = new Date(`${selectedDate}T${selectedTime}:00`);
    const now = new Date();

    const diffMs = chosen.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs < 0) {
      return {
        type: "error",
        message:
          "La fecha y hora de lanzamiento no pueden ser anteriores al momento actual.",
      };
    }

    if (diffDays < 3) {
      return {
        type: "error",
        message:
          "El lanzamiento debe programarse con al menos 3 días de antelación.",
      };
    }

    if (diffDays >= 3 && diffDays < 21) {
      return {
        type: "warning",
        message:
          "Se recomienda enviar el lanzamiento con al menos 3 semanas de antelación para garantizar su correcta distribución en todas las plataformas digitales.",
      };
    }

    return null;
  }, [selectedDate, selectedTime]);

  const isInvalid = validation?.type === "error";

  return (
    <form action={formAction} className="flex-col gap-lg">

      {/* TÍTULO */}
      <div className="form-group">
        <label className="form-label">Título del Lanzamiento</label>
        <input
          type="text"
          name="title"
          defaultValue={release.title}
          className="form-input"
          required
        />
      </div>

      {/* ARTISTA DEL LANZAMIENTO */}
      <div className="form-group">
        <label className="form-label">Artista del lanzamiento</label>
        <input
          type="text"
          name="artistName"
          defaultValue={
  release.releaseArtists?.[0]?.artistName ||
  release.artist?.user?.name ||
  ""
}
          className="form-input"
          placeholder="Nombre del artista o banda"
          required
        />
      </div>

      {/* FECHA */}
      <div className="form-group">
        <label className="form-label">Fecha de Lanzamiento</label>

        <div style={{ display: "flex", gap: "1rem" }}>
          <input
            type="date"
            name="releaseDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            required
          />

          <input
            type="time"
            name="releaseTime"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {validation && (
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              fontSize: "0.85rem",
              background:
                validation.type === "error"
                  ? "rgba(239,68,68,0.1)"
                  : "rgba(245,158,11,0.1)",
              border:
                validation.type === "error"
                  ? "1px solid #ef4444"
                  : "1px solid #f59e0b",
              color:
                validation.type === "error"
                  ? "#ef4444"
                  : "#f59e0b",
            }}
          >
            {validation.message}
          </div>
        )}
      </div>

      {/* GÉNERO */}
      <div className="form-group">
        <label className="form-label">Género Principal</label>
        <select
          name="genre"
          defaultValue={release.genre || ""}
          className="form-input"
          required
        >
          <option value="">Seleccionar género</option>
          {GENRES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* IDIOMA */}
      <div className="form-group">
        <label className="form-label">Idioma de la canción</label>
        <select
          name="language"
          defaultValue={release.language || ""}
          className="form-input"
        >
          <option value="">Seleccionar idioma</option>

          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label} ({lang.code})
            </option>
          ))}
        </select>
      </div>

      {/* TIPO */}
      <div className="form-group">
        <label className="form-label">Tipo de Lanzamiento</label>
        <select
          name="distributionType"
          defaultValue={release.distributionType || ""}
          className="form-input"
          required
        >
          <option value="">Seleccionar</option>
          <option value="SINGLE">Single</option>
          <option value="EP">EP</option>
          <option value="ALBUM">Album</option>
        </select>
      </div>

      <div className="flex justify-between mt-lg">

        <button
          type="submit"
          name="nextStep"
          value="cover"
          className="btn btn-primary"
          disabled={pending || isInvalid}
        >
          Guardar y continuar →
        </button>
      </div>
    </form>
  );
}