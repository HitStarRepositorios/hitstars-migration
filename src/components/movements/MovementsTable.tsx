"use client"

import { useMemo } from "react"
import Badge from "@/components/ui/Badge"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table"

type Movement = {
  id: string
  type: string
  kind?: string // MASTER, PUBLISHING, PRODUCER
  status: string
  amount: number
  createdAt: string
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB")
}

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toFixed(2)
  const sign = amount < 0 ? "-" : "+"
  return `${sign}€${abs}`
}

export default function MovementsTable({ data = [] }: { data?: Movement[] }) {

const sorted = useMemo(() => {

  return [...data].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  )

}, [data])

  const columns = useMemo<ColumnDef<Movement>[]>(() => [

    {
      header: "Date",
      accessorKey: "createdAt",
      cell: info => (
        <span className="text-gray-300">
          {formatDate(info.getValue<string>())}
        </span>
      )
    },

    {
      header: "Type",
      accessorKey: "type",
cell: info => {

  const row = info.row.original
  const type = (row.type ?? "").toUpperCase()
  const kind = (row.kind ?? "").toUpperCase()

  if (type === "ROYALTY") {
    if (kind === "MASTER") return <Badge color="purple">MASTER ROYALTY</Badge>
    if (kind === "PUBLISHING") return <Badge color="blue">PUBLISHING ROYALTY</Badge>
    if (kind === "PRODUCER") return <Badge color="red">PRODUCER ROYALTY</Badge>
    return <Badge color="purple">ROYALTY</Badge>
  }

  if (type === "WITHDRAWAL") {
    return <Badge color="red">WITHDRAWAL</Badge>
  }

  if (type === "PAYOUT") {
    return <Badge color="blue">PAYOUT</Badge>
  }

  if (type === "ADJUSTMENT") {
    return <Badge color="yellow">ADJUSTMENT</Badge>
  }

  return <Badge>{type}</Badge>

}
    },

    {
      header: "Status",
      accessorKey: "status",
cell: info => {

  const status = (info.getValue<string>() ?? "").toUpperCase()

  if (status === "PAID") {
    return <Badge color="green">PAID</Badge>
  }

  if (status === "PENDING") {
    return <Badge color="yellow">PENDING</Badge>
  }

  if (status === "FAILED") {
    return <Badge color="red">FAILED</Badge>
  }

  if (status === "CANCELLED") {
    return <Badge color="gray">CANCELLED</Badge>
  }

  return <Badge>{status}</Badge>

}
    },

    {
      header: "Amount",
      accessorKey: "amount",
      cell: info => {

        let amount = info.getValue<number>()
        const row = info.row.original

        if (row.type === "WITHDRAWAL" && amount > 0) {
          amount = -amount
        }

        const positive = amount > 0

        return (
          <span
            className={`font-semibold tabular-nums ${positive ? "text-green-400" : "text-red-400"
              }`}
          >
            {formatAmount(amount)}
          </span>
        )
      }
    }

  ], [])

  const table = useReactTable({
    data: sorted,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  if (!sorted.length) {
    return (
      <div className="glass-panel p-8 text-center text-muted text-sm">
        No movements yet
      </div>
    )
  }

  return (

    <div className="glass-panel overflow-hidden">

      <table className="w-full text-sm">

        <thead className="border-b border-white/10 text-muted">

          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>

              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="text-left py-4 px-6 text-xs font-medium"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}

            </tr>
          ))}

        </thead>

        <tbody>

          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className="border-b border-white/5 hover:bg-white/[0.03] transition"
            >

              {row.getVisibleCells().map((cell, i) => (
                <td
                  key={cell.id}
                  className={`py-5 px-6 ${i === 3 ? "text-right" : "text-left"
                    }`}
                >

                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}

                </td>
              ))}

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )

}