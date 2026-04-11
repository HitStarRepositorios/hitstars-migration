import { prisma } from "@/lib/prisma";
import { approveKyc, rejectKyc } from "@/app/actions/adminKyc";

export default async function AdminKycPage() {
  const kycs = await prisma.kycVerification.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        include: { documents: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-lg">
      <div className="glass-panel">
        <h2 className="text-gradient">KYC Pendientes</h2>

        {kycs.length === 0 && (
          <p className="text-muted mt-md">
            No hay verificaciones pendientes.
          </p>
        )}
      </div>

      {kycs.map((kyc) => (
        <div key={kyc.id} className="glass-panel">
          {/* Info del usuario */}
          <div style={{ marginBottom: "1rem" }}>
            <strong style={{ wordBreak: "break-all" }}>
              {kyc.user.email}
            </strong>

            <div className="text-muted text-sm" style={{ marginTop: "0.25rem" }}>
              {kyc.user.firstName} {kyc.user.lastName}
            </div>

            <div className="text-muted text-sm" style={{ marginTop: "0.25rem" }}>
              Documento: {kyc.documentType} — {kyc.documentNumber}
            </div>

            {kyc.user.documents.length > 0 && (
              <div style={{ marginTop: "0.5rem" }}>
                <a
                  href={kyc.user.documents[0].url}
                  target="_blank"
                  className="text-gradient"
                  style={{ fontSize: "0.85rem" }}
                >
                  Ver documento subido →
                </a>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "1rem",
            }}
          >
            {/* Aprobar */}
            <form action={approveKyc.bind(null, kyc.id)}>
              <button className="btn btn-primary" style={{ width: "100%" }}>
                ✅ Aprobar verificación
              </button>
            </form>

            {/* Rechazar */}
            <form
              action={async (formData) => {
                "use server";
                const reason = formData.get("reason") as string;
                await rejectKyc(kyc.id, reason);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <input
                type="text"
                name="reason"
                placeholder="Motivo del rechazo..."
                required
                className="form-input"
              />
              <button className="btn btn-red" style={{ width: "100%" }}>
                ❌ Rechazar
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}