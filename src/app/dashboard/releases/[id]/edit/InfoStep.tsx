"use client";

import { useActionState } from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { updateReleaseInfoAction } from "@/app/actions/releases";
import { GENRES } from "@/lib/genres";
import { LANGUAGES } from "@/lib/languages";

function LanguageSelect({ defaultValue, languages }: { defaultValue: string, languages: any[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [value, setValue] = useState(defaultValue);
  
  const selectedLang = languages.find(l => l.code === value);
  const filtered = languages.filter(l => 
    l.label.toLowerCase().includes(search.toLowerCase()) || 
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function click(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  return (
    <div className="relative" ref={ref} style={{ position: "relative" }}>
      <input type="hidden" name="language" value={value} />
      
      <div 
        className="form-input" 
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => { setOpen(!open); setSearch(""); }}
      >
        <span>{selectedLang ? `${selectedLang.label} (${selectedLang.code})` : "Seleccionar idioma"}</span>
        <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, 
          background: "#1b1b22", border: "1px solid rgba(255,255,255,0.1)", 
          borderRadius: "8px", marginTop: "4px", padding: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
        }}>
          <input 
            type="text" 
            autoFocus
            placeholder="Buscar idioma..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ marginBottom: "8px", padding: "6px 10px", minHeight: "36px", width: "100%" }}
          />
          <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
            {filtered.length === 0 ? <div style={{ padding: "8px", opacity: 0.5, fontSize: "0.9rem" }}>No se encontraron idiomas.</div> : null}
            {filtered.map(lang => (
              <div 
                key={lang.code}
                onClick={() => { setValue(lang.code); setOpen(false); }}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: value === lang.code ? "rgba(139,92,246,0.2)" : "transparent",
                  color: value === lang.code ? "#c4b5fd" : "inherit",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (value !== lang.code) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (value !== lang.code) e.currentTarget.style.background = "transparent";
                }}
              >
                {lang.label} ({lang.code})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
        <LanguageSelect defaultValue={release.language || ""} languages={LANGUAGES} />
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