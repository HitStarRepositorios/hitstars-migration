import { prisma } from "@/lib/prisma"

export async function GET() {

  try {

    const earnings = await prisma.royaltyEarning.findMany({
      where: {
        kind: "PRODUCER"
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
    REVENUE POR TRACK
    ==========================
    */

    const byTrack: Record<string, any> = {}

    for (const e of earnings) {

      const title = e.track?.title ?? "Unknown"

      if (!byTrack[title]) {
        byTrack[title] = {
          title,
          revenue: 0,
          streams: 0
        }
      }

      byTrack[title].revenue += Number(e.amount ?? 0)
      byTrack[title].streams += Number(e.streams ?? 0)

    }

    return Response.json({
      totalRevenue: totalRevenue ?? 0,
      totalStreams: totalStreams ?? 0,
      byTrack: Object.values(byTrack) ?? []
    })

  } catch (error) {

    console.error("PRODUCER SUMMARY ERROR:", error)

    return Response.json({
      totalRevenue: 0,
      totalStreams: 0,
      byTrack: [],
      error: "Failed to load producer analytics"
    })

  }

}