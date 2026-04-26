"use client"

import { useEffect, useState } from "react"
import RoyaltyTable from "@/components/analytics/RoyaltyTable"
import RoyaltyCharts from "@/components/analytics/RoyaltyCharts"
import TopTracks from "@/components/analytics/TopTracks"
import { DSP_NAMES } from "@/lib/platforms"


export default function AnalyticsPage() {



  const [data, setData] = useState({
    transactions: [],
    balance: 0,
    available: 0,
    pending: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")


  const transactions = data?.transactions ?? []

  const [platformFilter, setPlatformFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")

  useEffect(() => {

    async function load() {

      try {

        const res = await fetch("/api/royalties/summary")
        const json = await res.json()



        console.log("ROYALTIES", json.transactions)



        setData(json)

      } catch (err) {

        console.error(err)

      } finally {

        setLoading(false)

      }

    }

    load()

  }, [])


  if (loading) {
    return (
      <div className="glass-panel p-8">
        Loading analytics...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="glass-panel p-8">
        Failed to load analytics.
      </div>
    )
  }


  const filteredTransactions = transactions.filter((tx: any) => {

    if (
      search &&
      !tx.track.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }

    if (platformFilter !== "ALL" && tx.platform !== platformFilter) {
      return false
    }

if (typeFilter !== "ALL") {

  if (typeFilter === "MASTER") {
    return tx.kind === "MASTER"
  }

  if (typeFilter === "PUBLISHING") {
    return tx.kind === "PUBLISHING"
  }

  if (typeFilter === "PRODUCER") {
    return tx.kind === "PRODUCER"
  }

  if (typeFilter === "WITHDRAWAL") {
    return tx.track === "WITHDRAWAL" || tx.type === "WITHDRAWAL"
  }

}

    return true

  })


  return (

    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>


      {/* BALANCE CARDS */}

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          width: "100%"
        }}
      >

        <div
          className="glass-panel"
          style={{
            flex: 1,
            padding: "1.5rem"
          }}
        >

          <div className="text-muted text-sm mb-2">
            Balance Total
          </div>

          <div className="text-3xl font-bold">
            €{(data?.balance ?? 0).toFixed(2)}
          </div>

        </div>


        <div
          className="glass-panel"
          style={{
            flex: 1,
            padding: "1.5rem"
          }}
        >

          <div className="text-muted text-sm mb-2">
            Balance Disponible
          </div>

          <div className="text-3xl font-bold text-green-400">
            €{(data?.available ?? 0).toFixed(2)}
          </div>

        </div>


        <div
          className="glass-panel"
          style={{
            flex: 1,
            padding: "1.5rem"
          }}
        >

          <div className="text-muted text-sm mb-2">
            Royalties Pendientes
          </div>

          <div className="text-3xl font-bold text-yellow-400">
            €{(data?.pending ?? 0).toFixed(2)}
          </div>

        </div>

      </div>


      <RoyaltyCharts transactions={transactions} />

      <TopTracks transactions={transactions} />

      {/* TABLE PANEL */}

      <div className="glass-panel p-8 space-y-6">

        {/* HEADER */}

        <div className="space-y-6">

          {/* TITLE */}

          <h2 className="text-3xl font-semibold">
            Actividad Reciente
          </h2>

          {/* FILTER BAR */}

          <div className="flex items-center gap-lg">

            <input
              placeholder="Search track..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ width: "320px" }}
            />

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="form-input"
              style={{ width: "200px" }}
            >
              <option value="ALL">All Platforms</option>
              {Object.entries(DSP_NAMES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input"
              style={{ width: "200px" }}
            >
              <option value="ALL">All Royalties</option>
              <option value="MASTER">Master</option>
              <option value="PUBLISHING">Publishing</option>
              <option value="PRODUCER">Producer</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>

          </div>





        </div>

        {/* TABLE */}

        <RoyaltyTable data={filteredTransactions} />

      </div>

    </div>

  )

}