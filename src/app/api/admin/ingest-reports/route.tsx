import { ingestReports } from "@/lib/royalties/ingestReports"
import { createRoyaltyMovements } from "@/lib/royalties/createRoyaltiesMovements"

export async function POST() {

  await ingestReports()

  await createRoyaltyMovements()

  return Response.json({
    success: true
  })

}