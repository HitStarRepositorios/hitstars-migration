import { prisma } from "@/lib/prisma"

export async function runProducerRoyaltyEngine(): Promise<number> {
  let createdCount = 0

  const rows = await prisma.producerReport.findMany({
    where: {
      processed: false
    }
  })

  for (const row of rows) {
    /*
    ==========================
    FIND TRACK (ISRC → TITLE)
    ==========================
    */
    let track = await prisma.track.findFirst({
      where: { isrc: row.isrc },
      include: {
        release: { include: { artist: { include: { user: true } } } },
        masterParties: { include: { rightsHolder: true } }
      }
    })

    // Fallback: Buscar por título si no hay ISRC
    if (!track && row.trackTitle) {
      track = await prisma.track.findFirst({
        where: { title: { mode: "insensitive", contains: row.trackTitle } },
        include: {
          release: { include: { artist: { include: { user: true } } } },
          masterParties: { include: { rightsHolder: true } }
        }
      })
      if (track) console.log(`PRODUCER ENGINE: Matched track by title fallback: ${row.trackTitle}`)
    }

    if (!track) {
      console.warn("PRODUCER ENGINE: track not found", row.isrc || row.trackTitle)
      continue
    }

    /*
    ==========================
    FIND PRODUCER HOLDER
    ==========================
    */
    let holder = null

    if (row.producerIpi) {
      holder = await prisma.rightsHolder.findFirst({
        where: { ipi: row.producerIpi }
      })
    }

    if (!holder) {
      const producerParty = track.masterParties.find(p => p.role === "PRODUCER")
      holder = producerParty?.rightsHolder ?? null
    }

    // Fallback 2: El artista principal (si no hay nada más)
    if (!holder && track.release?.artist) {
      const artistHolder = await prisma.rightsHolder.findFirst({
        where: { userId: track.release.artist.userId }
      })
      if (artistHolder) {
        holder = artistHolder
        console.log(`PRODUCER ENGINE: Fallback assignment to main artist: ${track.release.artist.user.name}`)
      }
    }

    if (!holder) {
      console.warn("PRODUCER ENGINE: holder not found for track", track.title)
      continue
    }

    /*
    ==========================
    PREVENT DUPLICATES
    ==========================
    */
    const existing = await prisma.royaltyEarning.findFirst({
      where: {
        trackId: track.id,
        rightsHolderId: holder.id,
        reportMonth: row.reportMonth,
        kind: "PRODUCER"
      }
    })

    if (existing) {
      await prisma.producerReport.update({ where: { id: row.id }, data: { processed: true } })
      continue
    }

    const share = 100
    const amount = row.revenue * (share / 100)

    const earning = await prisma.royaltyEarning.create({
      data: {
        trackId: track.id,
        rightsHolderId: holder.id,
        streams: row.streams,
        revenue: row.revenue,
        share,
        amount,
        reportMonth: row.reportMonth,
        kind: "PRODUCER"
      }
    })

    createdCount++

    if (holder.userId) {
      await prisma.royaltyTransaction.create({
        data: {
          userId: holder.userId,
          rightsHolderId: holder.id,
          trackId: track.id,
          type: "ROYALTY",
          status: "AVAILABLE",
          amount,
          currency: row.currency ?? "EUR",
          sourceId: earning.id,
          sourceType: "ROYALTY_EARNING",
          reportMonth: row.reportMonth
        }
      })
    }

    await prisma.producerReport.update({
      where: { id: row.id },
      data: { processed: true }
    })
  }

  return createdCount
}