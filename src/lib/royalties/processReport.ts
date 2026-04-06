import { parseSpotify } from "./parsers/spotifyParser"
import { parseApple } from "./parsers/appleParser"
import { prisma } from "@/lib/prisma"
import { Platform } from "@prisma/client"

type DSPRow = {
  platform: Platform
  date: string
  isrc: string
  country: string
  streams: number
  revenue: number
}

export async function processReport(report: any) {

  let rows: DSPRow[] = []

  if (report.platform === "SPOTIFY") {
    rows = parseSpotify(report.data)
  }

  if (report.platform === "APPLE_MUSIC") {
    rows = parseApple(report.data)
  }

  for (const row of rows) {

    if (!row?.isrc) continue

    /*
    ==========================
    VALIDATE DATE
    ==========================
    */

    const rawDate = row.date ? new Date(row.date) : new Date()

    if (isNaN(rawDate.getTime())) {
      console.warn("Invalid report date:", row)
      continue
    }

    const reportDate = new Date(
      rawDate.getFullYear(),
      rawDate.getMonth(),
      1
    )

    /*
    ==========================
    VALIDATE NUMBERS
    ==========================
    */

    const streams = Number(row.streams ?? 0)
    const revenue = Number(row.revenue ?? 0)

    if (isNaN(streams) || isNaN(revenue)) {
      console.warn("Invalid numeric values:", row)
      continue
    }

    if (streams === 0 && revenue === 0) continue

    /*
    ==========================
    FIND TRACK
    ==========================
    */

    const track = await prisma.track.findFirst({
      where: { isrc: row.isrc }
    })

    if (!track) {
      console.warn("Track not found for ISRC:", row.isrc)
      continue
    }

    /*
    ==========================
    NORMALIZE COUNTRY
    ==========================
    */

    const country = row.country ?? "UNKNOWN"

    /*
    ==========================
    PREVENT DUPLICATES
    ==========================
    */

    const existing = await prisma.royaltyUsage.findFirst({
      where: {
        trackId: track.id,
        platform: row.platform,
        country,
        reportMonth: reportDate
      }
    })

    if (existing) continue

    /*
    ==========================
    CREATE USAGE
    ==========================
    */

    await prisma.royaltyUsage.create({
      data: {
        isrc: row.isrc,

        trackId: track.id,
        releaseId: track.releaseId,

        platform: row.platform,
        country,

        streams,
        revenue,
        currency: "USD",

        reportMonth: reportDate
      }
    })

  }

}