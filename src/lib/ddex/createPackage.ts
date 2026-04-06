import fs from "fs-extra"
import path from "path"
import archiver from "archiver"
import { buildERN } from "./buildERN"
import { getDDEXBaseDir } from "./paths"

export async function createDDEXPackage(release: any) {

  const baseDir = path.join(getDDEXBaseDir(), release.id)

  const resourcesDir = path.join(baseDir, "resources")
  const artworkDir = path.join(baseDir, "artwork")

  await fs.ensureDir(resourcesDir)
  await fs.ensureDir(artworkDir)

  /*
  GENERATE ERN XML
  */

  const xml = await buildERN(release)

  const xmlPath = path.join(baseDir, "ern.xml")

  await fs.writeFile(xmlPath, xml)

  /*
  COPY AUDIO FILES
  */

  for (const track of release.tracks) {

    const fileName = `${track.trackNumber}.wav`

    const dest = path.join(resourcesDir, fileName)

    await fs.copy(track.fileUrl, dest)

  }

  /*
  COPY COVER
  */

  if (release.coverUrl) {

    const coverDest = path.join(artworkDir, "cover.jpg")

    await fs.copy(release.coverUrl, coverDest)

  }

  /*
  CREATE MANIFEST
  */

  const manifest = {

    releaseId: release.id,
    upc: release.upc,
    tracks: release.tracks.map((t: any) => ({
      trackNumber: t.trackNumber,
      isrc: t.isrc
    }))

  }

  await fs.writeJson(
    path.join(baseDir, "manifest.json"),
    manifest,
    { spaces: 2 }
  )

  /*
  CREATE ZIP
  */

  const zipPath = path.join(getDDEXBaseDir(), `${release.id}.zip`)

  const output = fs.createWriteStream(zipPath)

  const archive = archiver("zip", { zlib: { level: 9 } })

  archive.pipe(output)

  archive.directory(baseDir, false)

  await archive.finalize()

  return zipPath
}