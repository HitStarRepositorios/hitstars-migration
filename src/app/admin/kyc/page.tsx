import { prisma } from "@/lib/prisma";
import { approveKyc, rejectKyc } from "@/app/actions/adminKyc";

export default async function AdminKycPage() {
const kycs = await prisma.kycVerification.findMany({
  where: {
    status: "PENDING",
  },
  include: {
    user: {
      include: {
        documents: true,
      },
    },
  },
  orderBy: {
    createdAt: "asc",
  },
});

  return (
    <div className="flex-col gap-lg">
      <div className="glass-panel">
        <h2 className="text-gradient">KYC Pendientes</h2>

        {kycs.length === 0 && (
          <p className="text-muted mt-md">
            No hay verificaciones pendientes.
          </p>
        )}

        {kycs.map((kyc) => (
          <div
            key={kyc.id}
            style={{
              padding: "1rem",
              marginTop: "1rem",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{kyc.user.email}</strong>

              <div className="text-muted text-sm">
                {kyc.user.firstName} {kyc.user.lastName}
              </div>

              <div className="text-muted text-sm">
                Documento: {kyc.documentType} — {kyc.documentNumber}
                {kyc.user.documents.length > 0 && (
  <div style={{ marginTop: "0.5rem" }}>
    <a
      href={kyc.user.documents[0].url}
      target="_blank"
      className="text-gradient"
      style={{ fontSize: "0.85rem" }}
    >
      Ver documento subido
    </a>
  </div>
)}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <form action={approveKyc.bind(null, kyc.id)}>
                <button className="btn btn-primary">
                  Aprobar
                </button>
              </form>

              <form
                action={async (formData) => {
                  "use server";
                  const reason = formData.get("reason") as string;
                  await rejectKyc(kyc.id, reason);
                }}
              >
                <input
                  type="text"
                  name="reason"
                  placeholder="Motivo rechazo"
                  required
                  style={{
                    padding: "0.5rem",
                    marginRight: "0.5rem",
                  }}
                />
                <button className="btn btn-secondary">
                  Rechazar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}