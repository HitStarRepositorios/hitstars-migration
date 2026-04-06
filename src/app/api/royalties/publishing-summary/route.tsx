import { prisma } from "@/lib/prisma"

export async function GET() {

  try {

    const earnings = await prisma.royaltyEarning.findMany({
      where: {
        kind: "PUBLISHING"
      },
      include: {
        track: {
          select: {
            title: true
          }
        }
      }
    })

    /*
    ==========================
    TOTALS
    ==========================
    */

    let totalRevenue = 0
    let totalStreams = 0

    for (const e of earnings) {

      totalRevenue += Number(e.amount ?? 0)
      totalStreams += Number(e.streams ?? 0)

    }

    /*
    ==========================
    REVENUE POR OBRA
    ==========================
    */

    const byWork: Record<string, any> = {}

    for (const e of earnings) {

      const title = e.track?.title ?? "Unknown"

      if (!byWork[title]) {
        byWork[title] = {
          title,
          revenue: 0,
          streams: 0
        }
      }

      byWork[title].revenue += Number(e.amount ?? 0)
      byWork[title].streams += Number(e.streams ?? 0)

    }

    return Response.json({
      totalRevenue: totalRevenue ?? 0,
      totalStreams: totalStreams ?? 0,
      byWork: Object.values(byWork) ?? []
    })

  } catch (error) {

    console.error("PUBLISHING SUMMARY ERROR:", error)

    return Response.json({
      totalRevenue: 0,
      totalStreams: 0,
      byWork: [],
      error: "Failed to load publishing analytics"
    })

  }

}