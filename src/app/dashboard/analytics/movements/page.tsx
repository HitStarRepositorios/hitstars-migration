"use client"

import { useEffect, useState } from "react"
import MovementsTable from "@/components/movements/MovementsTable"

export default function MovementsPage() {

  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [amount, setAmount] = useState("")

  useEffect(() => {

    async function load() {

      const res = await fetch("/api/movements")
      const json = await res.json()

      setMovements(Array.isArray(json) ? json : [])
      setLoading(false)

    }

    load()

  }, [])


  async function requestWithdrawal() {

    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount)
      })
    })

const json = await res.json()

if (!res.ok) {
  alert(json.error || "Withdrawal failed")
  return
}

setMovements(prev => [json, ...prev])
setAmount("")

  }


const balance = movements
  .filter(m => ["AVAILABLE", "PAID"].includes(m.status))
  .reduce((sum, m) => sum + Number(m.amount || 0), 0)

const pending = movements
  .filter(m => m.status === "PENDING")
  .reduce((sum, m) => sum + Number(m.amount || 0), 0)


  if (loading) {
    return <div className="glass-panel p-8">Loading movements...</div>
  }




  return (


    <div className="flex flex-col w-full max-w-full">

      {/* BALANCE */}

      <div
        style={{
          display: "flex",
          width: "100%",
          gap: "24px"
        }}
      >

        <div
          className="glass-panel"
          style={{
            flex: 1,
            padding: "1rem",
            minHeight: "60px"
          }}
        >

          <div className="text-muted text-sm mb-3">
            Available balance
          </div>

          <div className="text-3xl font-bold">
            €{balance.toFixed(2)}
          </div>

        </div>


        <div
          className="glass-panel"
          style={{
            flex: 1,
            padding: "1rem",
            minHeight: "60px"
          }}
        >

          <div className="text-muted text-sm mb-3">
            Pending balance
          </div>

          <div className="text-3xl font-bold text-yellow-400">
            €{pending.toFixed(2)}
          </div>

        </div>

      </div>


      {/* SEPARADOR REAL */}
      <div style={{ height: "24px" }} />


      {/* WITHDRAW */}

      <div className="glass-panel">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >

          <div className="form-group" style={{ minWidth: "220px" }}>
            <label className="form-label">
              Withdrawal amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="form-input"
            />
          </div>

          <button
            onClick={requestWithdrawal}
            className="btn btn-primary"
            style={{
              height: "42px",
              padding: "0 1.6rem"
            }}
          >
            Request withdrawal
          </button>

        </div>

      </div>

      {/* SEPARADOR REAL */}
      <div style={{ height: "24px" }} />



      {/* TABLE */}






      <MovementsTable data={movements || []} />



    </div>


  )

}