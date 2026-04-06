"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveKyc(kycId: string) {
  await prisma.kycVerification.update({
    where: { id: kycId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/kyc");
}

export async function rejectKyc(kycId: string, reason: string) {
  await prisma.kycVerification.update({
    where: { id: kycId },
    data: {
      status: "REJECTED",
      rejectedReason: reason,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/kyc");
}