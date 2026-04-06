import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('cover') as File
    const releaseId = formData.get('releaseId') as string

    if (!file || !releaseId) {
      return NextResponse.json({ error: 'Faltan datos (archivo o releaseId)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const processedBuffer = await sharp(buffer)
      .resize(3000, 3000, { fit: 'fill' })
      .toFormat('png')
      .toBuffer()

    const fileName = `${releaseId}-${Date.now()}.png`
    const key = `cover/${fileName}`

    const bucketName = process.env.R2_BUCKET_NAME
    const accountId = process.env.R2_ACCOUNT_ID
    const publicUrl = process.env.R2_PUBLIC_URL

    console.log('[upload-cover] Config:', { bucketName, accountId: accountId?.slice(0,8), publicUrl })

    if (!bucketName) throw new Error('R2_BUCKET_NAME not configured')
    if (!accountId) throw new Error('R2_ACCOUNT_ID not configured')

    const { r2Client } = await import('@/lib/r2')
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')

    console.log('[upload-cover] Uploading to R2:', key)

    await r2Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: processedBuffer,
      ContentType: 'image/png'
    }))

    console.log('[upload-cover] Upload successful')

    const coverUrl = `${publicUrl}/${key}`

    await prisma.release.update({
      where: { id: releaseId },
      data: { coverUrl }
    })

    return NextResponse.json({ coverUrl })
  } catch (error: any) {
    console.error('[upload-cover] FATAL ERROR:', error.message, error.Code)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}