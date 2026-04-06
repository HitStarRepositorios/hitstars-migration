"use client";

import { useState } from "react";

export default function SignContractForm({
  releaseId,
}: {
  releaseId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

 async function handleSign() {
  if (!accepted) return;

  setLoading(true);
  setError(null);

  try {
    const res = await fetch("/api/contracts/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ releaseId }),
    });

    if (!res.ok) {
      throw new Error("Error al firmar");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Contrato-firmado.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.location.href = "/dashboard/releases";
  } catch (err) {
    setError("Ha ocurrido un error al firmar.");
    setLoading(false);
  }
}

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <h3>Firmar contrato</h3>

      <p className="text-muted">
        Antes de firmar, asegúrate de haber leído completamente el contrato.
      </p>

      {/* CHECKBOX LEGAL */}
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.6rem",
          fontSize: "0.9rem",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={accepted}
          onChange={() => setAccepted(!accepted)}
          style={{ marginTop: "3px" }}
        />

        <span>
          Declaro que he leído íntegramente el contrato y acepto sus términos
          de forma electrónica, con plena validez legal.
        </span>
      </label>

      {error && (
        <div
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleSign}
        disabled={!accepted || loading}
        className="btn btn-primary"
        style={{
          opacity: !accepted || loading ? 0.6 : 1,
          cursor:
            !accepted || loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Firmando..." : "Firmar contrato"}
      </button>
    </div>
  );
}