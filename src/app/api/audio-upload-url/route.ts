import { NextResponse } from "next/server";
import { r2Client } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: "R2_BUCKET_NAME not configured" }, { status: 500 });
    }

    // Generar una clave única para el archivo, sanitizando el nombre
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `audio/${Date.now()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || "audio/wav",
    });

    // La URL firmada expira en 60 minutos
    let signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    
    // Si la URL generada usa un custom domain (ej: https://cdn.hitstar.es)
    // El dominio ya apunta al bucket, así que no hace falta incluir el nombre del bucket en la ruta
    const baseUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
    const publicUrl = baseUrl ? `${baseUrl}/${key}` : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${key}`;

    return NextResponse.json({ 
      signedUrl, 
      publicUrl,
      key 
    });
  } catch (error: any) {
    console.error("Error generating R2 signed URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
