"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    setSent(true);
  }

  return (
    <div className="glass-panel" style={{ maxWidth: 400, margin: "4rem auto" }}>
      <h2>Recuperar contraseña</h2>

      {sent ? (
        <p className="text-muted mt-md">
          Si el email existe, te hemos enviado un enlace.
        </p>
      ) : (
        <form
  onSubmit={handleSubmit}
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    marginTop: "2rem",
  }}
>
          <input
            type="email"
            className="form-input"
            placeholder="Tu email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
  className="btn btn-primary"
  style={{
    marginTop: "0.5rem",
    padding: "0.9rem 1.2rem",
  }}
>
  Restablecer contraseña
</button>
        </form>
      )}
    </div>
  );
}