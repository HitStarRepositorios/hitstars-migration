import { NextResponse } from "next/server"

import { ingestReports } from "@/lib/royalties/ingestReports"
import { ingestPublishingReport } from "@/lib/royalties/ingestPublishingReport"
import { ingestProducerReport } from "@/lib/royalties/ingestProducerReport"

import { royaltyJobRunner } from "@/lib/royalties/royaltyJobRunner"

export async function POST() {

  try {

    console.log("===================================")
    console.log("ROYALTY FULL PIPELINE START")
    console.log("===================================")

    /*
    ==========================
    MASTER (DSP REPORTS)
    ==========================
    */

    console.log("Ingesting DSP reports")

    await ingestReports()

    /*
    ==========================
    PUBLISHING (SGAE)
    ==========================
    */

    console.log("Ingesting publishing report")

    await ingestPublishingReport("src/storage/sgae.csv")

    /*
    ==========================
    PRODUCER (AGEDI)
    ==========================
    */

    console.log("Ingesting producer report")

    await ingestProducerReport("src/storage/agedi.csv")

    /*
    ==========================
    PROCESS ROYALTIES
    ==========================
    */

    console.log("Running royalty engines")

    await royaltyJobRunner()

    console.log("===================================")
    console.log("ROYALTY FULL PIPELINE FINISHED")
    console.log("===================================")

    return NextResponse.json({
      success: true
    })

  } catch (error) {

    console.error("ROYALTY PIPELINE ERROR", error)

    return NextResponse.json(
      { error: "Royalty pipeline failed" },
      { status: 500 }
    )

  }

}