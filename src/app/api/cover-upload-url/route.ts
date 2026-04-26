import { NextResponse } from "next/server";
import { r2Client } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const { releaseId, contentType, filename } = await req.json();

    if (!releaseId) {
      return NextResponse.json({ error: "Falta releaseId" }, { status: 400 });
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: "R2 no configurado" }, { status: 500 });
    }

    const ext = filename?.split('.').pop() || 'png';
    const sanitizedFilename = filename?.replace(/[^a-zA-Z0-9.-]/g, "_") || `cover.${ext}`;
    const key = `cover/${releaseId}-${Date.now()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || "image/png",
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    
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
