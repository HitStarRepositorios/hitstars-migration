import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ReleaseStatus } from "@prisma/client";
import SignContractForm from "./sign-form";

import ContractPreview from "@/components/contracts/ContractPreview";

export default async function SignReleasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const release = await prisma.release.findUnique({
    where: { id },
  });

  if (!release) return notFound();

  if (release.status !== ReleaseStatus.AWAITING_SIGNATURE) {
    redirect("/dashboard/releases");
  }

  return (
    <div className="flex-col gap-lg">
      {/* ============================
          PREVIEW DEL CONTRATO (PDF)
      ============================ */}

      <div className="glass-panel">
        <h2>Contrato</h2>

<div
  style={{
    marginTop: "1.5rem",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    height: "80vh",
  }}
>
<ContractPreview
  url={`/api/contracts/preview?releaseId=${release.id}`}
/>
        </div>
      </div>

      {/* ============================
          FIRMA
      ============================ */}

      <div className="glass-panel">
        <SignContractForm releaseId={release.id} />
      </div>
    </div>
  );
}