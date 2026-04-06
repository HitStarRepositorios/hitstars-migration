import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.R2_BUCKET_NAME || "hitstar";

if (!accountId) {
  console.warn("R2_ACCOUNT_ID is not defined. R2 operations will fail.");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

/**
 * Helper to upload a file (Buffer or Uint8Array) to Cloudflare R2.
 * @param key The destination path in the bucket (e.g. 'contracts/123.pdf')
 * @param body The file content
 * @param contentType Optional content type for the object
 */
export async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType?: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await r2Client.send(command);
    console.log(`[R2 Upload Success]: ${key}`);
    
    return {
      success: true,
      url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`,
    };
  } catch (error) {
    console.error(`[R2 Upload Failed]: ${key}`, error);
    return { success: false, error };
  }
}

/**
 * Helper to list objects in an R2 bucket by prefix.
 * @param prefix The prefix to filter by (e.g. 'royalties/')
 */
export async function listR2Objects(prefix: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await r2Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error(`[R2 List Failed]: ${prefix}`, error);
    return [];
  }
}

/**
 * Helper to download an object from R2 as a Buffer.
 * @param key The object key
 */
export async function downloadFromR2(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await r2Client.send(command);
    if (!response.Body) return null;

    const stream = response.Body as any;
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error(`[R2 Download Failed]: ${key}`, error);
    return null;
  }
}
