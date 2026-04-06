import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PayoutForm from "./PayoutForm";

export default async function PayoutPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      kyc: true,
      payoutProfile: true,
    },
  });

  if (!user) redirect("/");

  if (user.kyc?.status !== "APPROVED") {
    redirect("/dashboard/kyc");
  }

  return (
    <PayoutForm existing={user.payoutProfile} />
  );
}