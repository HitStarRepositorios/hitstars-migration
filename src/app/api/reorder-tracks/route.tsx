import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const { releaseId, orderedIds } = await req.json();

  if (!releaseId || !orderedIds) {
    return NextResponse.json({ success: false });
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.track.update({
        where: { id },
        data: { trackNumber: index + 1 },
      })
    )
  );

  revalidatePath(`/dashboard/releases/${releaseId}/edit`);

  return NextResponse.json({ success: true });
}