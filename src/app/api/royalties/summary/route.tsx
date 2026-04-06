import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

/**
 * Enhanced Summary API: Real-time user-specific accounting based on transactions.
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.id

    // 1. Fetch all transactions for this user
    const transactions = await prisma.royaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    })

    // 2. Fetch track titles for context
    const trackIds = Array.from(new Set(transactions.filter(t => t.trackId).map(t => t.trackId as string)))
    const tracks = await prisma.track.findMany({
      where: { id: { in: trackIds } },
      select: { id: true, title: true }
    })
    const tracksMap = new Map(tracks.map(t => [t.id, t.title]))

    // 3. Fetch earnings kind for context
    const earningIds = transactions
      .filter(t => t.sourceType === "ROYALTY_EARNING" && t.sourceId)
      .map(t => t.sourceId as string)
    
    const earnings = await prisma.royaltyEarning.findMany({
      where: { id: { in: earningIds } },
      select: { id: true, kind: true, platform: true }
    })
    const earningsMap = new Map(earnings.map(e => [e.id, { kind: e.kind, platform: e.platform }]))

    /*
    -------------------------------------------------------
    ACCOUNTING LOGIC
    -------------------------------------------------------
    */

    // A. BALANCE TOTAL (Todo lo ganado acumulado, sin descontar retiros)
    const balanceTotal = transactions
      .filter(t => t.type === "ROYALTY" && t.status === "AVAILABLE")
      .reduce((sum, t) => sum + t.amount, 0)

    // B. PENDING PAYOUTS (Solicitudes de retiro en espera)
    const balancePending = transactions
      .filter(t => t.type === "WITHDRAWAL" && t.status === "PENDING")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // C. PAID PAYOUTS (Retiros ya efectuados)
    const balancePaid = transactions
      .filter(t => t.type === "WITHDRAWAL" && t.status === "PAID")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // D. BALANCE DISPONIBLE (Ganado - (Pendiente + Pagado))
    const available = balanceTotal - (balancePending + balancePaid)

    /*
    -------------------------------------------------------
    MAPPING FOR UI (Analytics Table)
    -------------------------------------------------------
    */

    const mappedTransactions = transactions.map(t => {
      const eInfo = t.sourceType === "ROYALTY_EARNING" ? earningsMap.get(t.sourceId!) : null
      
      return {
        id: t.id,
        track: t.trackId ? tracksMap.get(t.trackId) : t.type,
        platform: eInfo?.platform || "HitStar",
        kind: eInfo?.kind || "OTHERS",
        type: t.type,
        status: t.status,
        amount: t.amount,
        createdAt: t.createdAt
      }
    })

    return NextResponse.json({
      balance: balanceTotal - balancePaid,
      available,
      pending: balancePending,
      transactions: mappedTransactions
    })

  } catch (err) {
    console.error("SUMMARY ERROR:", err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}