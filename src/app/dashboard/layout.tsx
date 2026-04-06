import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      kyc: true,
      artist: true, // 🔥 AÑADE ESTO
    },
  });

  if (!user || !user.verified) {
    redirect("/verify-required");
  }

  if (!user.artist) {
    redirect("/onboarding/profile");
  }

  const kycStatus = user.kyc?.status ?? "NOT_STARTED";
  const showKycBanner = kycStatus !== "APPROVED";
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <div className="bg-mesh" />

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {/* Header */}
        <header
          className="glass-panel"
          style={{
            borderRadius: 0,
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h2 className="text-gradient" style={{ margin: 0 }}>
            Hit Star Portal
          </h2>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span className="text-secondary text-sm">
              {session.email}
            </span>

            <form action={logoutAction}>
              <button type="submit" className="btn btn-secondary">
                Salir
              </button>
            </form>
          </div>
        </header>

        {/* 🔔 KYC Banner */}
        {showKycBanner && (
          <div
            style={{
              maxWidth: "1200px",
              margin: "1.5rem auto 0 auto",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              background:
                kycStatus === "PENDING"
                  ? "rgba(250, 204, 21, 0.08)"
                  : kycStatus === "REJECTED"
                    ? "rgba(239, 68, 68, 0.08)"
                    : "rgba(109, 40, 217, 0.08)",
              border:
                kycStatus === "PENDING"
                  ? "1px solid rgba(250, 204, 21, 0.3)"
                  : kycStatus === "REJECTED"
                    ? "1px solid rgba(239, 68, 68, 0.3)"
                    : "1px solid rgba(109, 40, 217, 0.3)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              {kycStatus === "NOT_STARTED" && (
                <>
                  <strong>⚠️ Verificación requerida.</strong>{" "}
                  Debes completar tu verificación de identidad antes de distribuir música.
                </>
              )}

              {kycStatus === "PENDING" && (
                <>
                  <strong>🟡 Verificación en revisión.</strong>{" "}
                  Estamos revisando tu documentación.
                </>
              )}

              {kycStatus === "REJECTED" && (
                <>
                  <strong>🔴 Verificación rechazada.</strong>{" "}
                  Revisa tu documentación y vuelve a enviarla.
                </>
              )}
            </div>

            {kycStatus !== "PENDING" && (
              <Link
                href="/dashboard/kyc"
                className="btn btn-primary"
                style={{ whiteSpace: "nowrap" }}
              >
                {kycStatus === "REJECTED"
                  ? "Reenviar documentación"
                  : "Completar ahora"}
              </Link>
            )}
          </div>
        )}
        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: "2rem",
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            padding: "2rem 1rem",
          }}
        >
          {/* Sidebar */}
          <aside
            style={{
              width: "250px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Link
              href="/dashboard"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem" }}
            >
              Resumen
            </Link>

            <Link
              href="/dashboard/releases"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem" }}
            >
              Lanzamientos
            </Link>

            <Link
              href="/dashboard/analytics"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem" }}
            >
              Estadísticas & Royalties
            </Link>

            <Link
              href="/dashboard/kyc"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem" }}
            >
              Verificación de identidad
            </Link>

            {/* 👑 Admin Access */}
            {isAdmin && (
              <div
                style={{
                  marginTop: "2.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <Link
                  href="/admin"
                  className="glass-panel glass-panel-interactive"
                  style={{
                    padding: "1rem",
                    borderColor: "var(--accent-secondary)",
                    textAlign: "center",
                  }}
                >
                  👑 Panel Admin
                </Link>
              </div>
            )}
          </aside>

          {/* Main */}
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}