import { prisma } from "@/lib/prisma"
import { PRO } from "@prisma/client"

export async function runPublishingRoyaltyEngine(): Promise<number> {
  let createdCount = 0

  const rows = await prisma.publishingReport.findMany({
    where: { processed: false }
  })

  for (const row of rows) {

    /*
    ==========================
    MATCH WORK (BY ISWC → TITLE)
    ==========================
    */

    let work: any = null

    if (row.iswc) {
      work = await prisma.work.findFirst({
        where: { iswc: row.iswc },
        include: {
          tracks: {
            include: {
              release: { include: { artist: { include: { user: true } } } },
              publishingCredits: { include: { rightsHolder: true } }
            }
          }
        }
      })
    }

    // Fallback por título
    if (!work && row.workTitle) {

      const track = await prisma.track.findFirst({
        where: {
          title: {
            mode: "insensitive",
            contains: row.workTitle
          }
        },
        include: {
          release: { include: { artist: { include: { user: true } } } },
          publishingCredits: {
            include: {
              rightsHolder: true
            }
          }
        }
      })

      if (track) {

        work = {
          tracks: [track]
        }

        console.log(
          "PUBLISHING ENGINE: matched by title",
          row.workTitle
        )

      }

    }

    if (!work || !work.tracks?.length) {

      console.warn(
        "PUBLISHING ENGINE: work/track not found",
        row.iswc,
        row.workTitle
      )

      // Lo marcamos como procesado para no reintentar basura, pero no generamos earning
      await prisma.publishingReport.update({ where: { id: row.id }, data: { processed: true } })
      continue

    }

    const track = work.tracks[0]

    /*
    ==========================
    MATCH RIGHTS HOLDERS (IPI → CREDITS → MAIN ARTIST)
    ==========================
    */

    let holders: any[] = []

    const ipi = row.rightsHolderIpi?.trim()

    if (ipi) {

      const holder = await prisma.rightsHolder.findFirst({
        where: { ipi }
      })

      if (holder) {

        holders = [holder]

      }

    }

    // Fallback 1: Créditos del track
    if (holders.length === 0 && track.publishingCredits?.length) {

      holders = track.publishingCredits.map(
        (c: any) => c.rightsHolder
      )

    }

    // Fallback 2: El artista principal (si no hay nada más)
    if (holders.length === 0 && track.release?.artist) {
      const artistHolder = await prisma.rightsHolder.findFirst({
        where: { userId: track.release.artist.userId }
      })
      if (artistHolder) {
        holders = [artistHolder]
        console.log(`PUBLISHING ENGINE: Fallback assignment to main artist: ${track.release.artist.user.name}`)
      }
    }

    if (holders.length === 0) {

      console.warn(
        "PUBLISHING ENGINE: no holders found for track",
        track.title
      )

      await prisma.publishingReport.update({ where: { id: row.id }, data: { processed: true } })
      continue

    }

    const revenue = Number(row.revenue ?? 0)
    const streams = Number(row.streams ?? 0)

    /*
    ==========================
    PROCESS EACH HOLDER
    ==========================
    */

    for (const holder of holders) {

      // Buscamos si hay un share específico, si no usamos 100% (o repartido si hay varios fallbacks)
      let share = 0
      const credit = track.publishingCredits?.find((c: any) => c.rightsHolderId === holder.id)
      
      if (credit) {
        share = credit.share ?? 0
      } else {
        share = 100 / holders.length // Reparto equitativo si es fallback
      }

      if (share === 0) continue

      const amount = revenue * (share / 100)

      /*
      ==========================
      AVOID DUPLICATES
      ==========================
      */

      const existing = await prisma.royaltyEarning.findFirst({
        where: {
          trackId: track.id,
          rightsHolderId: holder.id,
          reportMonth: row.reportMonth,
          kind: "PUBLISHING"
        }
      })

      if (existing) continue

      /*
      ==========================
      CREATE EARNING
      ==========================
      */

      const earning = await prisma.royaltyEarning.create({
        data: {
          trackId: track.id,
          rightsHolderId: holder.id,

          pro: PRO.SGAE,

          streams,
          revenue,

          share,
          amount,

          reportMonth: row.reportMonth,

          kind: "PUBLISHING"
        }
      })

      createdCount++

      /*
      ==========================
      CREATE TRANSACTION
      ==========================
      */

      if (holder.userId) {
        await prisma.royaltyTransaction.create({
          data: {
            userId: holder.userId,
            rightsHolderId: holder.id,
            trackId: track.id,
            type: "ROYALTY",
            status: "AVAILABLE",
            amount,
            currency: "EUR",
            sourceId: earning.id,
            sourceType: "ROYALTY_EARNING",
            reportMonth: row.reportMonth
          }
        })
      }

    }

    /*
    ==========================
    MARK ROW PROCESSED
    ==========================
    */

    await prisma.publishingReport.update({
      where: { id: row.id },
      data: { processed: true }
    })

  }

  return createdCount
}