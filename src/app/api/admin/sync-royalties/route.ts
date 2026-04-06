import { NextResponse } from "next/server"
import { createRoyaltyMovements } from "@/lib/royalties/createRoyaltiesMovements"

export async function POST() {

  try {

    await createRoyaltyMovements()

    return NextResponse.json({
      success: true
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    )

  }

}