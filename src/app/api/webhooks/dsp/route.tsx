import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReleaseStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { releaseId, status } = body;

  if (!releaseId || !status) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
  });

  if (!release) {
    return NextResponse.json(
      { error: "Release not found" },
      { status: 404 }
    );
  }

  // Simulación de respuesta DSP
  if (status === "LIVE") {
    await prisma.release.update({
      where: { id: releaseId },
      data: {
        status: ReleaseStatus.LIVE,
        liveAt: new Date(),
      },
    });
  }

  return NextResponse.json({ success: true });
}