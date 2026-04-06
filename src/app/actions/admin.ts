"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function moderateReleaseAction(
  releaseId: string,
  status: "APPROVED" | "REJECTED"
) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  await prisma.release.update({
    where: { id: releaseId },
    data: {
      status,
      reviewedAt: new Date(),
      reviewedById: session.userId,
    },
  });

  revalidatePath("/admin/releases");
  revalidatePath("/dashboard/releases");

  redirect("/admin/releases");
}