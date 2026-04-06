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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="lg:col-span-2 glass-panel p-8 space-y-6">
        <h1 className="text-3xl font-semibold">Payout Requests</h1>

        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-muted">
            <tr>
              <th className="text-left py-4">Artist</th>
              <th className="text-left py-4">Amount</th>
              <th className="text-left py-4">Status</th>
              <th className="text-left py-4">Date</th>
              <th className="text-right py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {withdrawals.map(w => (
              <tr key={w.id} className="hover:bg-white/5 transition">
                <td className="py-4">
                  <div className="font-medium text-white">{w.user.name || "Sin nombre"}</div>
                  <div className="text-muted text-xs">{w.user.email}</div>
                </td>
                <td className="py-4 font-semibold text-lg text-primary">
                  €{Math.abs(w.amount).toFixed(2)}
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    w.status === 'PAID' ? 'bg-green-500/20 text-green-400' : 
                    w.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="py-4 text-muted">
                  {new Date(w.createdAt).toLocaleDateString("es-ES")}
                </td>
                <td className="py-4 text-right">
                  <button 
                    onClick={() => setSelected(w)}
                    className="btn btn-secondary py-1 text-xs"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETALLE DE REVISIÓN */}
      <div className="glass-panel p-8 space-y-6 relative overflow-hidden flex flex-col h-fit sticky top-6">
        {selected ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-white">Review Request</h2>
              <button 
                onClick={() => setSelected(null)}
                className="text-muted hover:text-white transition text-xs border border-white/10 px-2 py-1 rounded"
              >
                Close ✕
              </button>
            </div>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 shadow-inner">
              <div className="flex justify-between items-baseline">
                <span className="text-muted text-sm italic">Total Generado Histórico:</span>
                <span className="font-bold text-white text-lg">€{selected.user.totalEarned.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-muted text-sm italic">Balance Disponible Actual:</span>
                <span className="font-bold text-green-400 text-lg">€{selected.user.availableBalance.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-white font-black uppercase tracking-tighter">Monto Solicitado:</span>
                <span className="font-black text-2xl text-primary drop-shadow-[0_0_10px_rgba(219,39,119,0.3)]">
                  €{Math.abs(selected.amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em]">Historial Completo</h3>
                <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                  {selected.user.royaltyTransactions.length} registros
                </span>
              </div>
              
              <div className="space-y-2 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                {selected.user.royaltyTransactions.map((t: any) => (
                  <div key={t.id} className="flex justify-between items-center text-xs p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.05] transition group">
                    <div className="flex flex-col">
                      <span className="text-white font-medium group-hover:text-primary transition">{t.type}</span>
                      <span className="text-[10px] text-muted">{new Date(t.createdAt).toLocaleDateString("es-ES")} • {t.status}</span>
                    </div>
                    <span className={`font-bold text-sm ${t.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                      {t.amount > 0 ? "+" : ""}€{Math.abs(t.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selected.status === 'PENDING' && (
              <div className="flex flex-col gap-4 pt-6 border-t border-white/10 mt-auto">
                <button
                  onClick={() => action(selected.id, "APPROVE")}
                  className="btn btn-primary w-full py-4 text-base shadow-[0_0_20px_rgba(219,39,119,0.2)] hover:shadow-[0_0_30px_rgba(219,39,119,0.4)]"
                >
                  Confirm & Approve Payout
                </button>
                <button
                  onClick={() => action(selected.id, "REJECT")}
                  className="btn btn-red w-full py-3 hover:bg-red-500/30"
                >
                  Reject & Refund Balance
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="h-[500px] flex flex-col items-center justify-center text-muted text-center p-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-2xl opacity-20">📊</div>
            <p className="italic text-sm">Selecciona una solicitud para auditar el historial financiero y procesar el pago.</p>
          </div>
        )}
      </div>

    </div>
  )
}