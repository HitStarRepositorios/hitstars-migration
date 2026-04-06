import { ingestPublishingReport } from "@/lib/royalties/ingestPublishingReport"

export async function POST(){

  console.log("🔥 ingest-publishing endpoint hit")

  await ingestPublishingReport("src/storage/sgae_report.csv")

  return Response.json({
    success: true
  })
}