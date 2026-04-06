import { spawn, spawnSync } from "child_process"
import fs from "fs/promises"

type Segment = {
  start: number
  end: number
  type: string
}

type TrackAnalysis = {
  bpm: number | null
  tone: string | null
  danceability: string | null
  segments: Segment[]
}

export async function analyzeTrack(filepath: string): Promise<TrackAnalysis> {

  /* ---------- PREVIEW (reduce analysis time) ---------- */

  const previewPath = filepath + ".preview.wav"

  try {
    spawnSync("ffmpeg", [
      "-y",
      "-i", filepath,
      "-ac", "1",
      "-ar", "44100",
      previewPath
    ])
  } catch { }

  /* ---------- ESSENTIA ANALYSIS ---------- */

  let bpm: number | null = null
  let tone: string | null = null
  let danceability: string | null = null
  let segments: Segment[] = []

  try {

    const result = await new Promise<any>((resolve, reject) => {

      const py = spawn(
        "essentia-env/bin/python",
        ["src/lib/audio/analyze.py", filepath]
      )

      let data = ""

      py.stdout.on("data", chunk => {
        data += chunk
      })

      py.stderr.on("data", err => {
        console.error(err.toString())
      })

      py.on("close", () => {
        try {
          resolve(JSON.parse(data))
        } catch {
          reject("analysis failed")
        }
      })

    })

    bpm = result.bpm ?? null

    /* danceability numeric → label */

    if (typeof result.danceability === "number") {

      const score = result.danceability

      if (score < 0.2) danceability = "ambient"
      else if (score < 0.4) danceability = "groove"
      else if (score < 0.6) danceability = "dance"
      else if (score < 0.8) danceability = "club"
      else danceability = "peak"

    }

    tone = result.key && result.scale
      ? `${result.key} ${result.scale}`
      : null

    /* recoger segmentos desde Python */

    if (Array.isArray(result.segments)) {

      segments = result.segments
        .filter((s: any) =>
          typeof s.start === "number" &&
          typeof s.end === "number"
        )
        .map((s: any) => ({
          start: s.start,
          end: s.end,
          type: s.type || "section"
        }))

    }

  } catch (e) {
    console.error("Essentia analysis failed:", e)
  }

  /* cleanup preview */

  try {
    await fs.unlink(previewPath)
  } catch { }

  return {
    bpm,
    tone,
    danceability,
    segments
  }

}