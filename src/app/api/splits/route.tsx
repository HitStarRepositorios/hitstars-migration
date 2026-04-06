
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function getOrCreateRightsHolder(data: any, sessionUserId: string) {

  const name =
    data.name ||
    `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()

  const email = data.email ?? null

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId }
  })

  /*
  =========================
  DETECTAR SI ES EL USUARIO
  =========================
  */

  const isUser =
    data.isSelf === true ||
    (
      email &&
      user?.email &&
      email.toLowerCase() === user.email.toLowerCase()
    )

  /*
  =========================
  BUSCAR RIGHTS HOLDER EXISTENTE
  =========================
  */

  let holder = await prisma.rightsHolder.findFirst({
    where: {
      OR: [
        email ? { email } : undefined,
        name ? { name } : undefined
      ].filter(Boolean)
    }
  })

  if (holder) {

    // si ahora sabemos que es el usuario pero antes no estaba linkado
    if (isUser && !holder.userId) {
      holder = await prisma.rightsHolder.update({
        where: { id: holder.id },
        data: { userId: sessionUserId }
      })
    }

    return holder
  }

  /*
  =========================
  CREAR RIGHTS HOLDER
  =========================
  */

  holder = await prisma.rightsHolder.create({
    data: {
      name,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      email,
      phone: data.phone ?? null,
      taxId: data.taxId ?? null,
      taxCountry: data.taxCountry ?? null,
      nationality: data.nationality ?? null,
      ipi: data.ipi ?? null,
      pro: data.pro ?? null,
      userId: isUser ? sessionUserId : null
    }
  })

  return holder
}

export async function POST(req: NextRequest) {
  try {

    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      trackId,
      masterParties,
      publishingCredits,
      lyrics,
      composer,
      publisher,
      iswc
    } = await req.json()

    if (!trackId) {
      return NextResponse.json(
        { error: "TrackId requerido" },
        { status: 400 }
      )
    }

    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: { releaseId: true }
    })

    if (!track) {
      return NextResponse.json(
        { error: "Track no encontrado" },
        { status: 404 }
      )
    }

    /*
    ==========================
    UPDATE TRACK
    ==========================
    */

    await prisma.track.update({
      where: { id: trackId },
      data: {
        lyrics,
        composer,
        publisher,
        iswc
      }
    })

    /*
    ==========================
    MASTER VALIDATION
    ==========================
    */

    const cleanedMaster = (masterParties || []).filter(
      (m: any) =>
        m?.rightsHolder?.name &&
        m.rightsHolder.name.trim() !== "" &&
        Number(m.ownershipShare) > 0
    )

    if (cleanedMaster.length === 0) {
      return NextResponse.json(
        { error: "Debe existir al menos un titular MASTER" },
        { status: 400 }
      )
    }

    const masterTotal = cleanedMaster.reduce(
      (sum: number, m: any) =>
        sum + Number(m.ownershipShare),
      0
    )

    if (masterTotal !== 100) {
      return NextResponse.json(
        { error: "MASTER debe sumar 100%" },
        { status: 400 }
      )
    }

/*
==========================
MASTER SAVE
==========================
*/

await prisma.masterParty.deleteMany({
  where: { trackId }
})

const masterData: any[] = []

for (const m of cleanedMaster) {

  let rightsHolderId = m.rightsHolder?.id

  if (!rightsHolderId) {

    const holder = await getOrCreateRightsHolder(
      {
        name: m.rightsHolder.name?.trim(),
        email: m.rightsHolder.email,
        taxId: m.rightsHolder.taxId,
        taxCountry: m.rightsHolder.taxCountry,
        isSelf: m.rightsHolder.isSelf
      },
      session.id
    )

    rightsHolderId = holder.id
  }

  masterData.push({
    trackId,
    rightsHolderId,
    legalName: m.rightsHolder.name.trim(),
    role: m.role || "RIGHTSHOLDER",
    ownershipShare: Number(m.ownershipShare)
  })
}

await prisma.masterParty.createMany({
  data: masterData
})

/*
==========================
PUBLISHING VALIDATION
==========================
*/

const cleanedPublishing = (publishingCredits || []).filter(
  (p: any) =>
    (p?.rightsHolder?.firstName || p?.rightsHolder?.lastName) &&
    Number(p.share) > 0
)

if (cleanedPublishing.length > 0) {

  const publishingTotal = cleanedPublishing.reduce(
    (sum: number, p: any) => sum + Number(p.share),
    0
  )

  if (publishingTotal !== 100) {
    return NextResponse.json(
      { error: "PUBLISHING debe sumar 100%" },
      { status: 400 }
    )
  }

  await prisma.publishingCredit.deleteMany({
    where: { trackId }
  })

  const publishingData: any[] = []

  for (const p of cleanedPublishing) {

    let rightsHolderId = p.rightsHolder?.id

    if (!rightsHolderId) {

      const holder = await getOrCreateRightsHolder(
        {
          firstName: p.rightsHolder?.firstName?.trim(),
          lastName: p.rightsHolder?.lastName?.trim(),
          email: p.rightsHolder?.email,
          phone: p.rightsHolder?.phone,
          nationality: p.rightsHolder?.nationality,
          ipi: p.rightsHolder?.ipi,
          pro: p.rightsHolder?.pro,
          isSelf: p.rightsHolder?.isSelf
        },
        session.id
      )

      rightsHolderId = holder.id
    }

    publishingData.push({
      trackId,
      rightsHolderId,
      firstName: p.rightsHolder?.firstName?.trim() || "",
      lastName: p.rightsHolder?.lastName?.trim() || "",
      role: p.role,
      share: Number(p.share)
    })
  }

  await prisma.publishingCredit.createMany({
    data: publishingData
  })
}

console.log("Master guardado:", masterData)
console.log("Publishing guardado:", cleanedPublishing)

revalidatePath(`/dashboard/releases/${track.releaseId}/edit`)

return NextResponse.json({ success: true })

} catch (err) {

  console.error(err)

  return NextResponse.json(
    { error: "Error interno" },
    { status: 500 }
  )
}
}