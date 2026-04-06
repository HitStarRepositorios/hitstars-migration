"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function completeOnboardingAction() {
  const session = await getSession();
  if (!session) return;

  await prisma.user.update({
    where: { id: session.id },
    data: {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    },
  });
}