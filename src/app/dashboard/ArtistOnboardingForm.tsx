"use client";

import { createArtistAction } from "@/app/actions/artist";
import { useActionState, useState } from "react";
import { GENRES, GENRE_MAP } from "@/lib/genres";

export default function ArtistOnboardingForm() {
    const [state, formAction, pending] = useActionState(createArtistAction, null);
    const [selectedGenre, setSelectedGenre] = useState("");

    return (
        <form action={formAction} className="animate-fade-in">
            <div className="grid grid-cols-2 gap-md mb-md">
                <div className="form-group">
                    <label className="form-label" htmlFor="genre">Género Principal</label>
                    <select 
                      id="genre" 
                      name="genre" 
                      className="form-select w-full"
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un género</option>
                      {GENRES.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="subGenre">Subgénero</label>
                    <select 
                      id="subGenre" 
                      name="subGenre" 
                      className="form-select w-full"
                    >
                      <option value="">Selecciona (Opcional)</option>
                      {(GENRE_MAP[selectedGenre] || []).map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                </div>
            </div>

            <div className="form-group mb-md">
                <label className="form-label" htmlFor="bio">Biografía Corta</label>
                <textarea id="bio" name="bio" className="form-input" rows={4} placeholder="Cuéntanos un poco sobre ti y tu trayectoria musical..." required></textarea>
            </div>

            {state?.error && (
                <p className="text-center mb-md" style={{ color: 'var(--error)' }}>{state.error}</p>
            )}

            <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending ? "Guardando..." : "Completar Perfil"}
            </button>
        </form>
    );
}
