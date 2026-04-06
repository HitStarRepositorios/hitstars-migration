import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { trackId, composer, publisher, iswc, lyrics } = body;

  await prisma.track.update({
    where: { id: trackId },
    data: {
      composer,
      publisher,
      iswc,
      lyrics,
    },
  });

  return NextResponse.json({ success: true });
}