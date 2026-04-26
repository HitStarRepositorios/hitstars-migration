import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = params.id;

    // 1. Buscar el track en la BD para obtener su fileUrl
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: { fileUrl: true }
    });

    if (!track || !track.fileUrl) {
      return NextResponse.json({ error: "Track no encontrado" }, { status: 404 });
    }

    // 2. Extraer el Key (ej: audio/123.wav)
    // Asumimos que la URL es https://cdn.hitstar.es/audio/123.wav o similar
    const url = new URL(track.fileUrl);
    const key = url.pathname.startsWith("/") ? url.pathname.substring(1) : url.pathname;

    if (!key) {
      return NextResponse.json({ error: "Key no válida" }, { status: 400 });
    }

    // 3. Generar Presigned URL (valida por 1 hora)
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ url: signedUrl });
  } catch (error: any) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
