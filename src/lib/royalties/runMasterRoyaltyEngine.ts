import { prisma } from "@/lib/prisma"

export async function runMasterRoyaltyEngine(): Promise<number> {
  let createdCount = 0

  const usages = await prisma.royaltyUsage.findMany({
    where: {
      processed: false
    },
    include: {
      track: {
        include: {
          masterParties: {
            include: {
              rightsHolder: true
            }
          }
        }
      }
    }
  })

  for (const usage of usages) {
    const track = usage.track
    if (!track || !track.masterParties?.length || !usage.revenue || usage.revenue <= 0) {
      await prisma.royaltyUsage.update({ where: { id: usage.id }, data: { processed: true } })
      continue
    }

    for (const party of track.masterParties) {
      const share = party.revenueShare ?? party.ownershipShare ?? 0
      if (share === 0) continue

      const amount = usage.revenue * (share / 100)

      const existing = await prisma.royaltyEarning.findFirst({
        where: {
          usageId: usage.id,
          rightsHolderId: party.rightsHolderId,
          platform: usage.platform
        }
      })

      if (existing) continue

      const earning = await prisma.royaltyEarning.create({
        data: {
          usageId: usage.id,
          trackId: track.id,
          rightsHolderId: party.rightsHolderId,
          platform: usage.platform,
          streams: usage.streams,
          revenue: usage.revenue,
          share,
          amount,
          reportMonth: usage.reportMonth
        }
      })

      createdCount++

      if (party.rightsHolder?.userId) {
        await prisma.royaltyTransaction.create({
          data: {
            userId: party.rightsHolder.userId,
            rightsHolderId: party.rightsHolderId,
            trackId: track.id,
            type: "ROYALTY",
            status: "AVAILABLE",
            amount,
            currency: "EUR",
            sourceId: earning.id,
            sourceType: "ROYALTY_EARNING",
            reportMonth: usage.reportMonth
          }
        })
      }
    }

    await prisma.royaltyUsage.update({
      where: { id: usage.id },
      data: { processed: true }
    })
  }

  return createdCount
}