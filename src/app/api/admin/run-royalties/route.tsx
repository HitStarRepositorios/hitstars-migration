import { NextResponse } from "next/server"
import { royaltyJobRunner } from "@/lib/royalties/royaltyJobRunner"

export async function POST() {

  try {

    await royaltyJobRunner()

    return NextResponse.json({
      success: true
    })

  } catch (error) {

    console.error("ROYALTY JOB ERROR", error)

    return NextResponse.json(
      { error: "Royalty job failed" },
      { status: 500 }
    )

  }

}