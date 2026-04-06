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

  // 🔒 Si no hay sesión → login
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  // 🔒 Si no es admin → dashboard normal
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
        <header
          className="glass-panel"
          style={{
            borderRadius: 0,
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 className="text-gradient" style={{ margin: 0 }}>
            Hit Star Admin
          </h2>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span className="text-secondary text-sm">
              ADMIN: {session.email}
            </span>

            <form action={logoutAction}>
              <button type="submit" className="btn btn-secondary">
                Salir
              </button>
            </form>
          </div>
        </header>

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
          <aside
            style={{
              width: "250px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Link
              href="/admin"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem" }}
            >
              Resumen
            </Link>

            <Link
              href="/admin/releases"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem" }}
            >
              Revisión de Lanzamientos
            </Link>

            <Link
              href="/admin/kyc"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem" }}
            >
              Verificaciones KYC
            </Link>

            <Link
              href="/admin/withdrawals"
              className="glass-panel glass-panel-interactive"
              style={{ padding: "1rem" }}
            >
              Gestión de Pagos
            </Link>
          </aside>

          <main style={{ flex: 1 }}>{children}</main>
        </div>
      </div>
    </div>
  );
}