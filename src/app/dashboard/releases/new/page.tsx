"use client";

import { createReleaseAction } from "@/app/actions/releases";
import { useActionState } from "react";
import Link from "next/link";

export default function NewReleasePage() {
  const [state, formAction, pending] = useActionState(
    createReleaseAction,
    null
  );

  return (
    <div className="flex-col gap-lg">
      <div className="glass-panel">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2>Nuevo Lanzamiento</h2>
            <p className="text-muted">
              Crea tu borrador y completa la información paso a paso.
            </p>
          </div>
          <Link href="/dashboard" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>

        <form action={formAction} className="flex-col gap-lg">
          {/* INFORMACIÓN BÁSICA */}
          <div className="flex-col gap-md">
            <h4 className="text-secondary">Información Inicial</h4>

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Título del Lanzamiento
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="releaseDate">
                Fecha de Lanzamiento
              </label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Tipo de Lanzamiento
              </label>

              <select
                name="distributionType"
                className="form-input"
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="SINGLE">Single (1 pista)</option>
                <option value="EP">EP (2–6 pistas)</option>
                <option value="ALBUM">Álbum</option>
              </select>
            </div>
          </div>

          <hr
            style={{
              border: 0,
              borderTop: "var(--glass-border)",
              margin: "var(--spacing-xl) 0",
            }}
          />

          {/* CONTRATO */}
          <div className="flex-col gap-md">
            <h4 className="text-secondary">
              Contratos y Condiciones
            </h4>

            <div className="flex items-start gap-sm">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
                style={{ marginTop: "4px" }}
              />

              <label htmlFor="terms" className="text-sm">
                Acepto los{" "}
                <Link
                  href="/dashboard/releases/terms"
                  className="text-gradient"
                >
                  términos de distribución, contratos y reparto
                  de royalties
                </Link>{" "}
                de Hit Star. Confirmo que soy el propietario
                legítimo del material.
              </label>
            </div>
          </div>

          {state?.error && (
            <p
              style={{
                color: "var(--error)",
                marginTop: "1rem",
              }}
            >
              {state.error}
            </p>
          )}

          <div className="flex justify-between items-center mt-xl">
            <span className="text-sm text-muted">
              Se creará un borrador editable.
            </span>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={pending}
            >
              {pending ? "Creando..." : "Crear borrador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}