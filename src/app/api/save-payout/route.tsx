import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";


export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { iban, accountHolderName, taxId, vatNumber } = await req.json();

  if (!iban || !accountHolderName || !taxId) {
    return NextResponse.json(
      { error: "Campos obligatorios incompletos." },
      { status: 400 }
    );
  }

  await prisma.payoutProfile.upsert({
    where: { userId: session.id },
    update: {
      iban,
      accountHolderName,
      taxId,
      vatNumber,
    },
    create: {
      userId: session.id,
      iban,
      accountHolderName,
      taxId,
      vatNumber,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payout");

  return NextResponse.json({ success: true });
}