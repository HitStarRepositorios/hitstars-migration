import { prisma } from "@/lib/prisma"

export async function createRoyaltyMovements() {

  const earnings = await prisma.royaltyEarning.findMany({
    include: {
      rightsHolder: true
    }
  })

  console.log("TOTAL EARNINGS:", earnings.length)

  for (const earning of earnings) {

    console.log("CHECK EARNING:", earning.id)

    if (!earning.rightsHolder?.userId) {
      console.log("SKIP: no userId for rightsHolder", earning.rightsHolderId)
      continue
    }

    const existing = await prisma.royaltyTransaction.findFirst({
      where: {
        sourceId: earning.id,
        sourceType: "ROYALTY_EARNING"
      }
    })

    if (existing) {
      console.log("SKIP: movement already exists")
      continue
    }

    console.log("CREATING MOVEMENT FOR", earning.id)

    await prisma.royaltyTransaction.create({
      data: {
        userId: earning.rightsHolder.userId,
        rightsHolderId: earning.rightsHolderId,
        type: "ROYALTY",
        status: "PAID",
        amount: earning.amount,
        currency: "EUR",
        sourceId: earning.id,
        sourceType: "ROYALTY_EARNING",
        reportMonth: earning.reportMonth,
        requiresKyc: false
      }
    })

  }

}