"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setDone(true);

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <div className="glass-panel" style={{ maxWidth: 400, margin: "4rem auto" }}>
      <h2>Restablecer contraseña</h2>

      {done ? (
        <p className="text-muted mt-md">
          Contraseña actualizada correctamente. Redirigiendo...
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
            type="password"
            className="form-input"
            placeholder="Nueva contraseña"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
  className="btn btn-primary"
  style={{
    marginTop: "0.5rem",
    padding: "0.9rem 1.2rem",
  }}
>
  Enviar enlace
</button>
        </form>
      )}
    </div>
  );
}