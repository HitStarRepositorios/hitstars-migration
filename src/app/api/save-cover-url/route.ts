import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { releaseId, coverUrl } = await req.json();

    if (!releaseId || !coverUrl) {
      return NextResponse.json({ error: "Faltan datos (releaseId o coverUrl)" }, { status: 400 });
    }

    await prisma.release.update({
      where: { id: releaseId },
      data: { coverUrl }
    });

    return NextResponse.json({ success: true, coverUrl });
  } catch (error: any) {
    console.error("[save-cover-url] ERROR:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
