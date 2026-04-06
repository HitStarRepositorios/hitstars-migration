import { prisma } from "@/lib/prisma"

/**
 * Ingests a publishing (SGAE) report from a Buffer.
 * @param filename Original filename
 * @param content File content buffer
 */
export async function ingestPublishingReport(filename: string, content: Buffer) {
  console.log("Processing publishing report:", filename)

  const raw = content.toString("utf8")

  const rows = raw
    .trim()
    .split(/\r?\n/)       // soporta \n y \r\n
    .filter(Boolean)      // elimina líneas vacías

  rows.shift()            // remove header

  let created = 0

  for (const line of rows) {

    const cols = line.split(",").map(c => c.trim())

    if (cols.length < 8) continue

    const [
      iswc,
      work_title,
      rights_holder_ipi,
      streams,
      revenue,
      currency,
      territory,
      report_month
    ] = cols

    const streamsInt = Number(streams)
    const revenueFloat = Number(revenue)

    if (!work_title || !report_month) continue

    const reportDate = new Date(report_month)

    if (isNaN(reportDate.getTime())) {
      console.warn("Invalid report month:", report_month)
      continue
    }

    /*
    ==========================
    PREVENT DUPLICATES
    ==========================
    */

    const existing = await prisma.publishingReport.findFirst({
      where: {
        iswc: iswc || null,
        rightsHolderIpi: rights_holder_ipi || null,
        reportMonth: reportDate
      }
    })

    if (existing) continue

    await prisma.publishingReport.create({
      data: {
        iswc: iswc || null,
        workTitle: work_title,
        rightsHolderIpi: rights_holder_ipi || null,

        streams: streamsInt,
        revenue: revenueFloat,

        currency,
        territory,

        reportMonth: reportDate
      }
    })

    created++

  }

  console.log("Publishing rows ingested:", created)
  console.log("Publishing report ingest finished")

}