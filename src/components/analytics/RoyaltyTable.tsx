"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"

import { useState, useMemo } from "react"
import Badge from "@/components/ui/Badge"

type Transaction = {
  id: string
  track: string
  platform: string
  kind: string
  amount: number
  createdAt: string
}

export default function RoyaltyTable({ data }: { data: Transaction[] }) {

  const [sorting, setSorting] = useState<any>([])




  const columns: ColumnDef<Transaction>[] = [

    {
      header: "Track",
      accessorKey: "track",
      cell: info => (
        <span className="font-semibold text-white">
          {info.getValue<string>()}
        </span>
      )
    },


    {
      header: "Platform",
      accessorKey: "platform",
      cell: info => {

        const platform = info.getValue<string>()

        if (platform === "SPOTIFY")
          return <Badge color="green">Spotify</Badge>

        if (platform === "APPLE_MUSIC")
          return <Badge color="gray">Apple Music</Badge>

        if (platform === "YOUTUBE")
          return <Badge color="red">YouTube</Badge>

        return <Badge>{platform}</Badge>
      }
    },


    {
      header: "Type",
      accessorKey: "kind",
      cell: info => {

        const kind = info.getValue<string>()

        if (kind === "MASTER" || kind === "SOURCE")
          return <Badge color="purple">Master</Badge>

        if (kind === "PUBLISHING")
          return <Badge color="blue">Publishing</Badge>

        if (kind === "PRODUCER")
          return <Badge color="yellow">Producer</Badge>

        return <Badge>{kind}</Badge>

      }
    },

    {
      header: "Status",
      accessorKey: "status",
      cell: info => {
        const status = (info.getValue<string>() || "PENDING").toUpperCase()
        if (status === "PAID") return <Badge color="green">PAID</Badge>
        if (status === "AVAILABLE") return <Badge color="blue">AVAILABLE</Badge>
        if (status === "PENDING") return <Badge color="yellow">PENDING</Badge>
        if (status === "CANCELLED") return <Badge color="gray">CANCELLED</Badge>
        return <Badge>{status}</Badge>
      }
    },


    {
      header: "Amount",
      accessorKey: "amount",
      cell: info => {

        const amount = info.getValue<number>()

        return (
          <span className="font-semibold text-white tabular-nums">
            €{amount.toFixed(2)}
          </span>
        )
      }
    },


    {
      header: "Date",
      accessorKey: "createdAt",
      cell: info =>
        new Date(info.getValue<string>())
          .toLocaleDateString("en-GB")
    }

  ]


  const table = useReactTable({
    data: data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })


  return (

    <div className="space-y-6 w-full">


      {/* TABLE */}

      <div className="w-full overflow-auto rounded-xl border border-white/10">

        <table className="w-full table-fixed text-sm">

          {/* COLUMN WIDTHS */}

          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>


          {/* HEADER */}

          <thead className="bg-[#0f1117] sticky top-0">

            {table.getHeaderGroups().map(headerGroup => (

              <tr key={headerGroup.id}>

                {headerGroup.headers.map(header => {

                  const sorted = header.column.getIsSorted()

                  return (

                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-left px-10 py-5 text-xs uppercase tracking-wider
                                 text-muted border-b border-white/10 cursor-pointer"
                    >

                      <div className="flex items-center gap-2">

                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                        {sorted === "asc" && "▲"}
                        {sorted === "desc" && "▼"}

                      </div>

                    </th>

                  )

                })}

              </tr>

            ))}

          </thead>


          {/* BODY */}

          <tbody>

            {table.getRowModel().rows.map(row => (

              <tr
                key={row.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >

                {row.getVisibleCells().map(cell => (

                  <td
                    key={cell.id}
                    className="px-10 py-6 whitespace-nowrap"
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

    </div>

  )

}