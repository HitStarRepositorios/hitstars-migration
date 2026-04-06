import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { trackId } = await req.json();

  if (!trackId) {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  // 1. Obtener la info del track para borrar el archivo físico
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    select: { fileUrl: true }
  })

  if (track?.fileUrl) {
    const publicUrl = process.env.R2_PUBLIC_URL;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (publicUrl && bucketName && track.fileUrl.includes(publicUrl)) {
      try {
        const { r2Client } = await import("@/lib/r2")
        const { DeleteObjectCommand } = await import("@aws-sdk/client-s3")

        // La Key es todo lo que hay después del R2_PUBLIC_URL + barra
        const key = track.fileUrl.replace(`${publicUrl}/`, '')

        await r2Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key
        }))
      } catch (err) {
        console.error("Error deleting from R2:", err)
        // No bloqueamos el borrado de la DB aunque falle el físico
      }
    }
  }

  // 2. Borrar de la base de datos
  await prisma.track.delete({
    where: { id: trackId },
  });

  return NextResponse.json({ success: true });
}