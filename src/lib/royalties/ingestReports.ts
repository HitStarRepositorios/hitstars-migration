import { Readable } from "stream"
import csv from "csv-parser"
import { processReport } from "./processReport"

/**
 * Ingests a single DSP report (Spotify/Apple) from a Buffer.
 * @param filename Original filename for type detection
 * @param content File content buffer
 */
export async function ingestDSPReport(filename: string, content: Buffer) {
  const lowerFile = filename.toLowerCase()

  // Solo procesamos si es Spotify o Apple
  if (!lowerFile.includes("spotify") && !lowerFile.includes("apple")) {
    return { success: false, message: "Not a supported DSP report" }
  }

  const isTsv = lowerFile.endsWith(".tsv")
  const rows: any[] = []

  await new Promise<void>((resolve, reject) => {
    Readable.from(content)
      .pipe(csv({
        separator: isTsv ? "\t" : ","
      }))
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject)
  })

  if (lowerFile.includes("spotify")) {
    console.log("Processing Spotify report:", filename)
    await processReport({ platform: "SPOTIFY", data: rows })
  } else if (lowerFile.includes("apple")) {
    console.log("Processing Apple report:", filename)
    await processReport({ platform: "APPLE_MUSIC", data: rows })
  }

  return { success: true }
}

// Legacy support (optional, can be removed once orchestrator is live)
export async function ingestReports() {
  console.warn("ingestReports() is deprecated. Use the R2 orchestrator instead.")
}