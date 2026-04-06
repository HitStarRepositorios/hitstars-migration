import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {

  const { releaseId } = await req.json()

  if (!releaseId) {
    return Response.json({ error: "Missing releaseId" })
  }

  // 1. Obtener la info del release para borrar la portada física
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    select: { coverUrl: true }
  })

  if (release?.coverUrl) {
    const isR2 = release.coverUrl.includes(process.env.R2_PUBLIC_URL || '')
    
    if (isR2 && process.env.R2_BUCKET_NAME) {
      try {
        const { r2Client } = await import("@/lib/r2")
        const { DeleteObjectCommand } = await import("@aws-sdk/client-s3")

        // La Key es todo lo que hay después del R2_PUBLIC_URL + barra
        const key = release.coverUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '')

        await r2Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key
        }))
      } catch (err) {
        console.error("Error deleting from R2:", err)
      }
    }
  }

  // 2. Limpiar la URL en la base de datos
  await prisma.release.update({
    where: { id: releaseId },
    data: {
      coverUrl: null
    }
  })

  return Response.json({
    success: true
  })

}