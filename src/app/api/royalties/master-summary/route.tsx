import { prisma } from "@/lib/prisma"

export async function GET() {

  try {

    const earnings = await prisma.royaltyEarning.findMany({
      where: {
        kind: "MASTER"
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
    REVENUE POR PLATAFORMA
    ==========================
    */

    const byPlatformMap: any = {}

    for (const e of earnings) {

      const platform = e.platform ?? "UNKNOWN"

      if (!byPlatformMap[platform]) {
        byPlatformMap[platform] = {
          platform,
          _sum: {
            amount: 0,
            streams: 0
          }
        }
      }

      byPlatformMap[platform]._sum.amount += Number(e.amount ?? 0)
      byPlatformMap[platform]._sum.streams += Number(e.streams ?? 0)

    }

    const byPlatform = Object.values(byPlatformMap)

    /*
    ==========================
    STREAMS POR TRACK
    ==========================
    */

    const byTrackMap: any = {}

    for (const e of earnings) {

      const title = e.track?.title ?? "Unknown"

      if (!byTrackMap[title]) {
        byTrackMap[title] = {
          title,
          amount: 0,
          streams: 0
        }
      }

      byTrackMap[title].amount += Number(e.amount ?? 0)
      byTrackMap[title].streams += Number(e.streams ?? 0)

    }

    const byTrack = Object.values(byTrackMap)

    /*
    ==========================
    RESPONSE
    ==========================
    */

    return Response.json({
      balance: totalRevenue ?? 0,
      totalStreams: totalStreams ?? 0,
      totalRevenue: totalRevenue ?? 0,
      byPlatform: byPlatform ?? [],
      byTrack: byTrack ?? []
    })

  } catch (error) {

    console.error("MASTER SUMMARY ERROR:", error)

    return Response.json(
      {
        balance: 0,
        totalStreams: 0,
        totalRevenue: 0,
        byPlatform: [],
        byTrack: [],
        error: "Failed to load master analytics"
      },
      { status: 200 } // evita romper el frontend
    )

  }

}