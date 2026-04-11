"use client"

import { useEffect, useState } from "react"

type Withdrawal = {
  id: string
  amount: number
  status: string
  createdAt: string
  user: {
    email: string
    name?: string
  }
}

export default function AdminWithdrawalsPage() {

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  // Función para ordenar: PENDING arriba, otros abajo, luego por fecha
  const sortWithdrawals = (list: Withdrawal[]) => {
    return [...list].sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  useEffect(() => {

    async function load() {
      try {
        const res = await fetch(`/api/admin/withdrawals?cache_bust=${Date.now()}`)
        const json = await res.json()

        setWithdrawals(sortWithdrawals(json))
        setLoading(false)
      } catch (e) {
        console.error(e)
      }
    }

    load()

  }, [])

  async function action(id: string, type: "APPROVE" | "REJECT") {
    const finalStatus = type === "APPROVE" ? "PAID" : "CANCELLED";

    await fetch(`/api/admin/withdrawals/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: type })
    })

    alert(`Payout ${type === "APPROVE" ? "Approved" : "Rejected"} Successfully!`);

    // Actualizamos el estado local
    setWithdrawals(prev => {
      const updated = prev.map(x =>
        x.id === id ? { ...x, status: finalStatus } : x
      );
      return sortWithdrawals(updated);
    });

    // Actualizamos el objeto seleccionado para que los botones desaparezcan
    if (selected?.id === id) {
      setSelected((prev: any) => ({ ...prev, status: finalStatus }));
    }
  }

  if (loading) {
    return <div className="glass-panel p-8">Loading...</div>
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >

      {/* ── Lista de solicitudes ── */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.2rem, 4vw, 1.75rem)", fontWeight: 600, marginBottom: "1.25rem" }}>
          Payout Requests
        </h1>

        <div className="table-wrapper">
          <table style={{ width: "100%", fontSize: "0.85rem" }}>
            <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <tr>
                <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Artista</th>
                <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Importe</th>
                <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Estado</th>
                <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>Fecha</th>
                <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <div style={{ fontWeight: 500, color: "white", whiteSpace: "nowrap" }}>{w.user.name || "Sin nombre"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{w.user.email}</div>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                    €{Math.abs(w.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      background: w.status === "PAID" ? "rgba(34,197,94,0.15)" : w.status === "PENDING" ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)",
                      color: w.status === "PAID" ? "#4ade80" : w.status === "PENDING" ? "#facc15" : "#f87171",
                    }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(w.createdAt).toLocaleDateString("es-ES")}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                    <button
                      onClick={() => setSelected(w)}
                      className="btn btn-secondary btn-sm"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Panel de detalle ── */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        {selected ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Review Request</h2>
              <button
                onClick={() => setSelected(null)}
                style={{ fontSize: "0.75rem", border: "1px solid rgba(255,255,255,0.1)", padding: "0.25rem 0.5rem", borderRadius: "6px", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}
              >
                Cerrar ✕
              </button>
            </div>

            <div style={{ padding: "1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Generado Histórico:</span>
                <span style={{ fontWeight: 700 }}>€{selected.user.totalEarned.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Balance Disponible:</span>
                <span style={{ fontWeight: 700, color: "#4ade80" }}>€{selected.user.availableBalance.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.75rem" }}>
                <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.85rem" }}>Monto Solicitado:</span>
                <span style={{ fontWeight: 900, fontSize: "1.4rem", color: "var(--accent-secondary)" }}>
                  €{Math.abs(selected.amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Historial Completo</h3>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                  {selected.user.royaltyTransactions.length} registros
                </span>
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }} className="custom-scrollbar">
                {selected.user.royaltyTransactions.map((t: any) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px", marginBottom: "0.4rem" }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.type}</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                        {new Date(t.createdAt).toLocaleDateString("es-ES")} · {t.status}
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: t.amount > 0 ? "#4ade80" : "#f87171" }}>
                      {t.amount > 0 ? "+" : ""}€{Math.abs(t.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selected.status === "PENDING" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                <button
                  onClick={() => action(selected.id, "APPROVE")}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.85rem" }}
                >
                  ✅ Confirm & Approve Payout
                </button>
                <button
                  onClick={() => action(selected.id, "REJECT")}
                  className="btn btn-red"
                  style={{ width: "100%", padding: "0.75rem" }}
                >
                  ❌ Reject & Refund Balance
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ minHeight: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", opacity: 0.2, marginBottom: "0.75rem" }}>📊</div>
            <p style={{ fontSize: "0.85rem", fontStyle: "italic" }}>
              Selecciona una solicitud para auditar el historial financiero y procesar el pago.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}