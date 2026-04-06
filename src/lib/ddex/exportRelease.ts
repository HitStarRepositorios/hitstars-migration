import { prisma } from "@/lib/prisma"
import { buildERN } from "./buildERN"
import { calculateMD5 } from "./hash"
import { uploadToR2 } from "@/lib/r2"
import { getDDEXBaseDir } from "./paths"

import fs from "fs-extra"
import path from "path"
import os from "os"
import archiver from "archiver"
import { createWriteStream } from "fs"

export async function exportRelease(releaseId: string): Promise<string> {
  const tmpDir = getDDEXBaseDir()
  await fs.ensureDir(tmpDir)

  console.log("Starting DDEX export:", releaseId)

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: {
      releaseArtists: true,
      tracks: {
        include: {
          artists: true,
          publishingCredits: true,
          masterParties: true
        }
      }
    }
  })

  if (!release) {
    throw new Error("Release not found")
  }

  /*
  ZIP PATH (ONE PER RELEASE)
  */

  const zipPath = path.join(
    tmpDir,
    `${release.upc || releaseId}.zip`
  )

  /*
  IF ZIP EXISTS → REUSE
  */

  if (await fs.pathExists(zipPath)) {
    console.log("DDEX package already exists:", zipPath)
    return zipPath
  }

  /*
  CREATE TEMP FOLDER
  */

  const folder = path.join(tmpDir, releaseId)

  await fs.ensureDir(folder)

  const artworkDir = path.join(folder, "artwork")
  const resourceDir = path.join(folder, "resources")

  await fs.ensureDir(artworkDir)
  await fs.ensureDir(resourceDir)

  /*
  HASH MAP
  */

  const trackHashes: Record<string, string> = {}

  /*
  DOWNLOAD COVER
  */

  if (release.coverUrl) {

    try {

      const coverUrl = normalizeUrl(release.coverUrl)

      console.log("Downloading cover:", coverUrl)

      const coverPath = path.join(artworkDir, "cover.jpg")

      await downloadFile(coverUrl, coverPath)

    } catch (err) {

      console.error("Cover download failed:", err)

    }

  }

  /*
  DOWNLOAD AUDIO FILES + CALCULATE HASH
  */

  for (const track of release.tracks) {

    if (!track.fileUrl) {
      console.warn("Track missing fileUrl:", track.id)
      continue
    }

    try {

      const audioUrl = normalizeUrl(track.fileUrl)

      console.log("Downloading track:", audioUrl)

      const fileName = `${track.trackNumber}.wav`

      const audioPath = path.join(resourceDir, fileName)

      await downloadFile(audioUrl, audioPath)

      const md5 = calculateMD5(audioPath)

      trackHashes[track.id] = md5

      console.log("MD5:", track.title, md5)

    } catch (err) {

      console.error("Track download failed:", track.id, err)

    }

  }

  /*
  GENERATE ERN XML (NOW WITH HASHES)
  */

  console.log("Generating ERN")

  const xml = await buildERN(releaseId, trackHashes)

  const xmlPath = path.join(folder, "ern.xml")

  await fs.writeFile(xmlPath, xml)

  /*
  CREATE ZIP PACKAGE
  */

  console.log("Creating ZIP:", zipPath)

  await zipPackage(folder, zipPath)

  if (!(await fs.pathExists(zipPath))) {
    throw new Error("ZIP package creation failed")
  }

  /* 
  =====================================================
  PERSISTIR EN R2 (CLOUDFLARE)
  =====================================================
  */

  try {
    const zipBuffer = await fs.readFile(zipPath);
    const r2Key = `ddex/${release.upc || releaseId}.zip`;
    await uploadToR2(r2Key, zipBuffer, "application/zip");
  } catch (err) {
    console.error("[DDEX R2 Upload Failed]:", err);
  }

  console.log("DDEX package created and mirrored in R2:", zipPath)

  /*
  OPTIONAL CLEANUP
  */

  // await fs.remove(folder)

  return zipPath
}

/*
NORMALIZE URL
*/

function normalizeUrl(url: string) {

  if (!url) {
    throw new Error("Invalid URL")
  }

  if (url.startsWith("http")) {
    return url
  }

  const base = process.env.APP_URL || "http://localhost:3000"

  return `${base}${url}`

}

/*
DOWNLOAD FILE
*/

async function downloadFile(url: string, output: string) {

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Download failed: ${url}`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())

  await fs.writeFile(output, buffer)

}

/*
ZIP PACKAGE
*/

async function zipPackage(folder: string, zipPath: string) {

  return new Promise<void>((resolve, reject) => {

    const output = createWriteStream(zipPath)

    const archive = archiver("zip", {
      zlib: { level: 9 }
    })

    output.on("close", () => resolve())

    archive.on("error", reject)

    archive.pipe(output)

    archive.directory(folder, false)

    archive.finalize()

  })

}