import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'

/**
 * Enhanced Summary API: Real-time user-specific accounting based on transactions.
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json([])

    // 1. Fetch transactions
    const movements = await prisma.royaltyTransaction.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        createdAt: true,
        sourceId: true,
        sourceType: true
      }
    })

    // 2. Identify and fetch RoyaltyEarning details for detailed labeling
    const earningIds = movements
      .filter(m => m.sourceType === "ROYALTY_EARNING" && m.sourceId)
      .map(m => m.sourceId as string)

    const earnings = await prisma.royaltyEarning.findMany({
      where: { id: { in: earningIds } },
      select: { id: true, kind: true }
    })

    const earningsMap = new Map(earnings.map(e => [e.id, e.kind]))

    // 3. Attach 'kind' to the movements for the UI
    const enrichedMovements = movements.map(m => ({
      ...m,
      kind: m.sourceType === "ROYALTY_EARNING" ? earningsMap.get(m.sourceId!) : undefined
    }))

    return NextResponse.json(enrichedMovements)

  } catch (err) {
    console.error("Movements API error:", err)
    return NextResponse.json([], { status: 200 })
  }
}