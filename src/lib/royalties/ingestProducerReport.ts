import { prisma } from "@/lib/prisma"

/**
 * Ingests a producer (AGEDI) report from a Buffer.
 * @param filename Original filename
 * @param content File content buffer
 */
export async function ingestProducerReport(filename: string, content: Buffer) {
  console.log("Processing producer report:", filename)

  const raw = content.toString("utf8")

  const rows = raw
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)

  rows.shift() // remove header

  let created = 0

  for (const line of rows) {

    const cols = line.split(",").map(c => c.trim())

    if (cols.length < 8) continue

    const [
      isrc,
      track_title,
      producer_ipi,
      streams,
      revenue,
      currency,
      territory,
      report_month
    ] = cols

    const streamsInt = Number(streams)
    const revenueFloat = Number(revenue)

    if (!isrc || !report_month) continue

    /*
    ==========================
    PREVENT DUPLICATES
    ==========================
    */

    const existing = await prisma.producerReport.findFirst({
      where: {
        isrc,
        producerIpi: producer_ipi,
        reportMonth: new Date(report_month)
      }
    })

    if (existing) continue

    await prisma.producerReport.create({
      data: {
        isrc,
        trackTitle: track_title,
        producerIpi: producer_ipi,

        streams: streamsInt,
        revenue: revenueFloat,

        currency,
        territory,

        reportMonth: new Date(report_month)
      }
    })

    created++

  }

  console.log("Producer rows ingested:", created)
  console.log("Producer report ingest finished")

}