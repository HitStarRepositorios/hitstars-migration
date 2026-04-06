import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const withdrawals = await prisma.royaltyTransaction.findMany({
    where: { type: "WITHDRAWAL" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          royaltyTransactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              id: true,
              type: true,
              amount: true,
              status: true,
              createdAt: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Calculamos balance acumulado por usuario para la vista de revisión
  const enriched = withdrawals.map(w => {
    const userTransactions = w.user.royaltyTransactions || []
    const totalEarned = userTransactions
      .filter(t => t.type === "ROYALTY" && t.status === "AVAILABLE")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalWithdrawn = userTransactions
      .filter(t => t.type === "WITHDRAWAL" && t.status === "PAID")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      ...w,
      user: {
        ...w.user,
        totalEarned,
        availableBalance: totalEarned - totalWithdrawn
      }
    }
  })

  return NextResponse.json(enriched)
}