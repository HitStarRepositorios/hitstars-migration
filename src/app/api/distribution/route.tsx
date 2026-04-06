import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { releaseId, distribution } = body;

    if (!releaseId || !distribution) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const {
      platforms = [],
      territories = [],
      worldwide = false,
    } = distribution;

    await prisma.release.update({
      where: { id: releaseId },
      data: {
        distributionPlatforms: platforms,
        distributionTerritories: territories,
        distributionWorldwide: worldwide,
      },
    });

    revalidatePath(`/dashboard/releases/${releaseId}/edit`);
    revalidatePath(`/dashboard/releases/${releaseId}/sign`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Distribution save error:", error);
    return NextResponse.json(
      { error: "Failed to save distribution" },
      { status: 500 }
    );
  }
}