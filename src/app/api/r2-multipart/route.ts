import { NextRequest, NextResponse } from "next/server";
import { r2Client } from "@/lib/r2";
import { CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const bucketName = process.env.R2_BUCKET_NAME;

  try {
    if (!bucketName) throw new Error("R2_BUCKET_NAME is missing");

    // 1. Iniciar subida multipart
    if (action === "create") {
       const { filename, contentType } = await req.json();
       const key = `audio/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
       const cmd = new CreateMultipartUploadCommand({ Bucket: bucketName, Key: key, ContentType: contentType || "audio/wav" });
       const res = await r2Client.send(cmd);
       return NextResponse.json({ uploadId: res.UploadId, key });
    }
    
    // 2. Subir un trozo (chunk)
    if (action === "upload") {
       const uploadId = url.searchParams.get("uploadId");
       const key = url.searchParams.get("key");
       const partNumber = parseInt(url.searchParams.get("partNumber") || "1");
       
       if (!uploadId || !key) throw new Error("Missing uploadId or key");

       // Leemos el bloque binario directamente (Vercel no bloquea si es <= 4.5MB)
       const chunkBuffer = await req.arrayBuffer();
       
       const cmd = new UploadPartCommand({
          Bucket: bucketName,
          Key: key,
          PartNumber: partNumber,
          UploadId: uploadId,
          Body: new Uint8Array(chunkBuffer)
       });
       const res = await r2Client.send(cmd);
       
       return NextResponse.json({ ETag: res.ETag });
    }
    
    // 3. Finalizar subida y ensamblar
    if (action === "complete") {
       const { uploadId, key, parts } = await req.json();
       const cmd = new CompleteMultipartUploadCommand({
         Bucket: bucketName,
         Key: key,
         UploadId: uploadId,
         MultipartUpload: { Parts: parts }
       });
       await r2Client.send(cmd);
       
       // Generamos la URL pública final
       // Eliminamos barras finales por si la R2_PUBLIC_URL tiene un "/"
       const baseUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
       const publicUrlBase = baseUrl ? baseUrl : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}`;
       const publicUrl = `${publicUrlBase}/${key}`;
       
       return NextResponse.json({ publicUrl, key });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch(e: any) {
    console.error("R2 Multipart Error:", {
        action,
        message: e.message,
        stack: e.stack,
        code: e.code,
        requestId: e.$metadata?.requestId
    });
    return NextResponse.json({
        error: e.message,
        details: e.code || "UNKNOWN_ERROR",
        action: action
    }, { status: 500 });
  }
}
