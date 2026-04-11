import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="bg-mesh" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <header
          className="glass-panel dashboard-header"
          style={{
            borderRadius: 0,
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <h2
            className="text-gradient"
            style={{ margin: 0, fontSize: "clamp(1rem, 4vw, 1.5rem)" }}
          >
            👑 Hit Star Admin
          </h2>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span className="text-secondary text-sm hide-mobile">
              {session.email}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-secondary btn-sm">
                Salir
              </button>
            </form>
          </div>
        </header>

        {/* ── Content row ── */}
        <div
          className="dashboard-content"
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
          {/* ── Sidebar (desktop only) ── */}
          <aside className="sidebar-desktop sticky top-6 h-fit">
            <Link
              href="/admin"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              🏠 Resumen
            </Link>

            <Link
              href="/admin/releases"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              🎵 Revisión de Lanzamientos
            </Link>

            <Link
              href="/admin/kyc"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              🪪 Verificaciones KYC
            </Link>

            <Link
              href="/admin/withdrawals"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              💰 Gestión de Pagos
            </Link>

            <div
              style={{
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Link
                href="/dashboard"
                className="glass-panel glass-panel-interactive"
                style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}
              >
                ← Portal Artista
              </Link>
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="dashboard-main" style={{ flex: 1, minWidth: 0 }}>
            {children}
          </main>
        </div>
      </div>

      {/* ── Bottom Navigation (mobile only) ── */}
      <nav className="bottom-nav" aria-label="Admin navigation">
        <Link href="/admin" className="bottom-nav-item">
          <span className="bottom-nav-icon">🏠</span>
          Resumen
        </Link>

        <Link href="/admin/releases" className="bottom-nav-item">
          <span className="bottom-nav-icon">🎵</span>
          Lanzamientos
        </Link>

        <Link href="/admin/kyc" className="bottom-nav-item">
          <span className="bottom-nav-icon">🪪</span>
          KYC
        </Link>

        <Link href="/admin/withdrawals" className="bottom-nav-item">
          <span className="bottom-nav-icon">💰</span>
          Pagos
        </Link>

        <Link href="/dashboard" className="bottom-nav-item">
          <span className="bottom-nav-icon">←</span>
          Portal
        </Link>
      </nav>
    </div>
  );
}