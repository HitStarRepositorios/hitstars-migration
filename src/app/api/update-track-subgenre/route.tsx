import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { trackId, subGenre } = await req.json();

  await prisma.track.update({
    where: { id: trackId },
    data: { subGenre },
  });

  return NextResponse.json({ ok: true });
}