"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function validateIBAN(iban: string) {
  const cleaned = iban.replace(/\s+/g, "").toUpperCase();
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const converted = rearranged.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString()
  );

  let remainder = converted;
  while (remainder.length > 2) {
    remainder =
      (parseInt(remainder.slice(0, 9), 10) % 97).toString() +
      remainder.slice(9);
  }

  return parseInt(remainder, 10) % 97 === 1;
}

export default function PayoutForm({ existing }: any) {
  const router = useRouter(); // 🔥 AÑADIDO

  const [iban, setIban] = useState(existing?.iban || "");
  const [accountHolderName, setAccountHolderName] = useState(
    existing?.accountHolderName || ""
  );
  const [taxId, setTaxId] = useState(existing?.taxId || "");
  const [vatNumber, setVatNumber] = useState(existing?.vatNumber || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateIBAN(iban)) {
      alert("IBAN inválido.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/save-payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        iban,
        accountHolderName,
        taxId,
        vatNumber,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error);
      return;
    }

    // ✅ REDIRECCIÓN AUTOMÁTICA
    router.push("/dashboard");
    router.refresh(); // refresca datos del layout
  }

  return (
    <div
      className="glass-panel"
      style={{ maxWidth: 600, margin: "3rem auto" }}
    >
      <h2>Configuración de pagos</h2>

      <form onSubmit={handleSubmit} className="flex-col gap-md mt-lg">
        <div className="form-group">
          <label>Nombre del titular</label>
          <input
            className="form-input"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>IBAN</label>
          <input
            className="form-input"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>NIF / Tax ID</label>
          <input
            className="form-input"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>VAT Number (opcional)</label>
          <input
            className="form-input"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar método de pago"}
        </button>
      </form>
    </div>
  );
}