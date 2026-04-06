import { prisma } from "@/lib/prisma"

export async function generateISRC() {
  const year = new Date().getFullYear().toString().slice(-2)

  const seq = await prisma.codeSequence.findFirst({
    where: {
      type: "ISRC",
      year: Number(year)
    }
  })

  let nextNumber = 1

  if (seq) {
    nextNumber = seq.lastNumber + 1

    await prisma.codeSequence.update({
      where: { id: seq.id },
      data: { lastNumber: nextNumber }
    })
  } else {
    await prisma.codeSequence.create({
      data: {
        type: "ISRC",
        year: Number(year),
        lastNumber: 1
      }
    })
  }

  const country = "ES"
  const registrant = "HSE"

  const serial = String(nextNumber).padStart(5, "0")

  return `${country}${registrant}${year}${serial}`
}

export async function generateUPC() {

  const seq = await prisma.codeSequence.findFirst({
    where: { type: "UPC" }
  })

  let nextNumber = 1

  if (seq) {
    nextNumber = seq.lastNumber + 1

    await prisma.codeSequence.update({
      where: { id: seq.id },
      data: { lastNumber: nextNumber }
    })
  } else {
    await prisma.codeSequence.create({
      data: {
        type: "UPC",
        lastNumber: 1
      }
    })
  }

  const prefix = "198765"

  const serial = String(nextNumber).padStart(6, "0")

  return `${prefix}${serial}`
}

const PREFIX = "HS"

export async function generateCatalogNumber(): Promise<string> {

  const lastRelease = await prisma.release.findFirst({
    orderBy: {
      createdAt: "desc"
    },
    select: {
      catalogNumber: true
    }
  })

  let nextNumber = 1

  if (lastRelease?.catalogNumber) {

    const match = lastRelease.catalogNumber.match(/\d+/)

    if (match) {
      nextNumber = parseInt(match[0]) + 1
    }

  }

  const formatted = String(nextNumber).padStart(6, "0")

  return `${PREFIX}-${formatted}`
}

export async function generateISWC() {

  const seq = await prisma.codeSequence.findFirst({
    where: { type: "ISWC" }
  })

  let nextNumber = 1

  if (seq) {

    nextNumber = seq.lastNumber + 1

    await prisma.codeSequence.update({
      where: { id: seq.id },
      data: { lastNumber: nextNumber }
    })

  } else {

    await prisma.codeSequence.create({
      data: {
        type: "ISWC",
        lastNumber: 1
      }
    })

  }

  const serial = String(nextNumber).padStart(9, "0")

  return `T-${serial}-0`
}