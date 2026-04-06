import { prisma } from "@/lib/prisma"
import { generateISRC, generateUPC, generateCatalogNumber, generateISWC } from "@/lib/codes"

export async function assignCodes(releaseId: string) {

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: { tracks: true }
  })

  if (!release) return

  /*
  UPC
  */

  if (!release.upc) {

    const upc = await generateUPC()

    await prisma.release.update({
      where: { id: releaseId },
      data: { upc }
    })

  }

  /*
  CATALOG NUMBER
  */

  if (!release.catalogNumber) {

    const catalogNumber = await generateCatalogNumber()

    await prisma.release.update({
      where: { id: releaseId },
      data: { catalogNumber }
    })

  }

  /*
  TRACK CODES
  */

  for (const track of release.tracks) {

    /*
    ISRC
    */

    if (!track.isrc) {

      const isrc = await generateISRC()

      await prisma.track.update({
        where: { id: track.id },
        data: { isrc }
      })

    }

    /*
    WORK + ISWC
    */

    let work = await prisma.work.findFirst({
      where: {
        title: track.title,
        createdByArtistId: release.artistId
      }
    })

    if (!work) {

      const iswc = await generateISWC()

      work = await prisma.work.create({
        data: {
          title: track.title,
          iswc,
          createdByArtistId: release.artistId
        }
      })

    }

    /*
    LINK TRACK → WORK
    */

    if (!track.workId) {

      await prisma.track.update({
        where: { id: track.id },
        data: {
          workId: work.id,
          iswc: work.iswc
        }
      })

    }

  }

}