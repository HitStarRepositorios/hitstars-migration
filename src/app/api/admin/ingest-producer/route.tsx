import { ingestProducerReport } from "@/lib/royalties/ingestProducerReport"

export async function POST(){

  console.log("🔥 ingest-agedi endpoint hit")

  await ingestProducerReport("src/storage/agedi_report.csv")

  return Response.json({
    success:true
  })

}