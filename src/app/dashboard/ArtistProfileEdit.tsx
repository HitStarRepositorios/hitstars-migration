"use client";

import { useState } from "react";
import { createArtistAction } from "@/app/actions/artist";
import { GENRES, GENRE_MAP, getGenreLabel, getSubGenreLabel } from "@/lib/genres";

interface Props {
  initialBio: string;
  initialGenre: string;
  initialSubGenre?: string | null;
}

export default function ArtistProfileEdit({ initialBio, initialGenre, initialSubGenre }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [genre, setGenre] = useState(initialGenre);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("genre", genre);
    if (initialSubGenre) formData.append("subGenre", initialSubGenre);

    const result = await createArtistAction(null, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setIsEditing(false);
    }
    setLoading(false);
  }

  if (!isEditing) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-start gap-md">
          <div className="flex-1">
            <div className="flex items-center gap-sm mb-sm">
              <span className="badge badge-purple">{getGenreLabel(genre)}</span>
              {initialSubGenre && <span className="badge badge-blue">{getSubGenreLabel(genre, initialSubGenre)}</span>}
            </div>
            <p className="text-secondary" style={{ 
              fontSize: "var(--text-base)", 
              lineHeight: "1.7",
              whiteSpace: "pre-wrap",
              maxWidth: "600px" 
            }}>
              {bio}
            </p>
          </div>
          <button 
            onClick={() => setIsEditing(true)} 
            className="btn btn-secondary btn-sm"
            style={{ 
              padding: "2px 12px", 
              height: "28px", 
              fontSize: "0.75rem", 
              lineHeight: "1", 
              whiteSpace: "nowrap" 
            }}
          >
            Editar Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in glass-panel" style={{ 
      background: "rgba(255,255,255,0.02)", 
      padding: "var(--spacing-lg)",
      marginTop: "1rem"
    }}>
      <div className="grid grid-cols-2 gap-md mb-md">
        <div className="form-group">
          <label className="form-label">Género Principal</label>
          <select 
            value={genre} 
            onChange={(e) => {
              setGenre(e.target.value);
              // reset subgenre if it doesn't belong to the new genre
            }}
            name="genre"
            className="form-select w-full"
          >
            <option value="">Selecciona un género</option>
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Subgénero (Opcional)</label>
          <select 
            name="subGenre"
            defaultValue={initialSubGenre || ""} 
            className="form-select w-full"
          >
            <option value="">Ninguno</option>
            {(GENRE_MAP[genre] || []).map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Biografía Profesional</label>
        <textarea 
          rows={5}
          value={bio} 
          onChange={(e) => setBio(e.target.value)}
          className="form-input"
          placeholder="Escribe una breve descripción de tu carrera..."
          style={{ resize: "none" }}
        />
      </div>

      {error && (
        <p className="mb-md text-sm" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}

      <div className="flex gap-sm pt-sm">
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="btn btn-primary"
          style={{ minWidth: "140px" }}
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
        <button 
          onClick={() => setIsEditing(false)} 
          className="btn btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
