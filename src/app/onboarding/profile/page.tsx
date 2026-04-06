"use client";

import { useActionState } from "react";
import { createArtistAction } from "@/app/actions/artist";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GENRE_MAP } from "@/lib/genres";

export default function ProfileStep() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] =
  useState<keyof typeof GENRE_MAP | "">("");

  const [state, formAction, pending] = useActionState(
    async (prev: any, formData: FormData) => {
      const result = await createArtistAction(prev, formData);
      if (result?.success) {
        router.push("/onboarding/platforms");
      }
      return result;
    },
    null
  );

  const allowedSubgenres =
    selectedGenre && GENRE_MAP[selectedGenre]
      ? GENRE_MAP[selectedGenre]
      : [];

  const formatLabel = (value: string) =>
    value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      className="glass-panel"
      style={{ maxWidth: 700, margin: "4rem auto" }}
    >
      <h2 className="mb-lg">Perfil Artístico</h2>

      <p className="text-muted mb-lg">
        Cuéntanos más sobre tu proyecto musical.
      </p>

      <form action={formAction} className="flex-col gap-md">

        {/* =========================
            GÉNERO
        ========================== */}
        <div className="form-group">
          <label className="form-label">Género principal</label>

          <select
            name="genre"
            className="form-input"
            required
            value={selectedGenre}
            onChange={(e) =>
  setSelectedGenre(
    e.target.value as keyof typeof GENRE_MAP
  )

            }
          >
            <option value="">Selecciona un género</option>

            {Object.keys(GENRE_MAP).map((genreKey) => {
  const genre = genreKey as keyof typeof GENRE_MAP;

  return (
    <option key={genre} value={genre}>
      {formatLabel(genre)}
    </option>
  );
})}
          </select>
        </div>

        {/* =========================
            SUBGÉNERO (DINÁMICO)
        ========================== */}
        {selectedGenre && allowedSubgenres.length > 0 && (
          <div className="form-group">
            <label className="form-label">
              Subgénero <span className="text-muted">(opcional)</span>
            </label>

            <select name="subGenre" className="form-input">
              <option value="">Selecciona un subgénero</option>

              {allowedSubgenres.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* =========================
            BIO
        ========================== */}
        <div className="form-group">
          <label className="form-label">Biografía</label>
          <textarea
            name="bio"
            rows={4}
            placeholder="Describe tu proyecto musical..."
            className="form-input"
            required
          />
        </div>

        {state?.error && (
          <p style={{ color: "var(--error)" }}>{state.error}</p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={pending}
        >
          {pending ? "Guardando..." : "Continuar"}
        </button>
      </form>
    </div>
  );
}