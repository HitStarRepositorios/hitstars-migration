import { runMasterRoyaltyEngine } from "./runMasterRoyaltyEngine"
import { runPublishingRoyaltyEngine } from "./runPublishingRoyaltyEngine"
import { runProducerRoyaltyEngine } from "./runProducerRoyaltyEngine"

/**
 * Runs all royalty distribution engines and returns the total number of earnings generated.
 */
export async function royaltyJobRunner(): Promise<number> {
  console.log("===================================")
  console.log("ROYALTY JOB RUNNER START")
  console.log("===================================")

  let totalEarnings = 0

  // 1. MASTER
  console.log("Running MASTER royalties")
  totalEarnings += await runMasterRoyaltyEngine()

  // 2. PUBLISHING
  console.log("Running PUBLISHING royalties")
  totalEarnings += await runPublishingRoyaltyEngine()

  // 3. PRODUCER
  console.log("Running PRODUCER royalties")
  totalEarnings += await runProducerRoyaltyEngine()

  console.log("===================================")
  console.log(`ROYALTY JOB RUNNER FINISHED: ${totalEarnings} total earnings.`)
  console.log("===================================")

  return totalEarnings
}