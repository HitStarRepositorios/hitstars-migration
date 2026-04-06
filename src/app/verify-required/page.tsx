"use client";

import { useActionState } from "react";
import { resendVerificationAction } from "@/app/actions/auth";

export default function VerifyRequiredPage() {
  const [state, formAction, pending] = useActionState(
    resendVerificationAction,
    null
  );

  return (
    <div className="container pt-xl">
      <div
        className="glass-panel text-center"
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div>
          <h2 className="text-gradient">Verifica tu email</h2>
          <p className="text-muted mt-md">
            Hemos enviado un enlace de verificación a tu correo.
          </p>
        </div>

        <form
          action={formAction}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="Introduce tu email"
            className="form-input"
            required
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={pending}
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem",
            }}
          >
            {pending ? "Enviando..." : "Reenviar verificación"}
          </button>
        </form>

        {state?.success && (
          <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
            Si el email existe y no está verificado, hemos enviado un nuevo enlace.
          </p>
        )}

        {state?.error && (
          <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>
            {state.error}
          </p>
        )}
      </div>
    </div>
  );
}