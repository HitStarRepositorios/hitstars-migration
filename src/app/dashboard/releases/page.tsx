import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteReleaseButton from "@/components/DeleteReleaseButton";

export default async function ReleasesPage() {
  const session = await getSession();
  if (!session) {
    return <div>No session found</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { artist: true },
  });

  if (!user?.artist) {
    return (
      <div className="glass-panel">
        <h3>No tienes perfil de artista</h3>
        <p className="text-muted">
          Debes completar el onboarding antes de ver lanzamientos.
        </p>
      </div>
    );
  }

  const releases = await prisma.release.findMany({
    where: { artistId: user.artist.id },
    orderBy: { createdAt: "desc" },
  });

  const getStatusBadge = (release: any) => {
    const baseStyle = {
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "0.8rem",
      fontWeight: 500,
    };

    switch (release.status) {
      case "DRAFT":
        return (
          <span
            style={{
              ...baseStyle,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#3b82f6",
            }}
          >
            🔵 Borrador
          </span>
        );

      case "PENDING":
      case "SUBMITTED":
        return (
          <span
            style={{
              ...baseStyle,
              background: "rgba(250,204,21,0.1)",
              border: "1px solid rgba(250,204,21,0.3)",
              color: "#facc15",
            }}
          >
            🟡 En revisión editorial
          </span>
        );

      case "AWAITING_SIGNATURE":
        return (
          <span
            style={{
              ...baseStyle,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#f59e0b",
            }}
          >
            🟠 Pendiente de firma
          </span>
        );

      case "SIGNED":
        return (
          <span
            style={{
              ...baseStyle,
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.3)",
              color: "#a855f7",
            }}
          >
            🟣 Contrato firmado
          </span>
        );

      case "APPROVED":
        return (
          <span
            style={{
              ...baseStyle,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981",
            }}
          >
            🟢 Aprobado
          </span>
        );

      case "REJECTED":
        return (
          <span
            style={{
              ...baseStyle,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            🔴 Requiere cambios
          </span>
        );

      case "DISTRIBUTING":
        return (
          <span
            style={{
              ...baseStyle,
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.3)",
              color: "#0ea5e9",
            }}
          >
            🚀 Distribuyendo
          </span>
        );

      case "LIVE":
        return (
          <span
            style={{
              ...baseStyle,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#22c55e",
            }}
          >
            🌍 En tiendas
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-col gap-lg">
      <div className="glass-panel">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2>Mis Lanzamientos</h2>
            <p className="text-muted">
              Gestiona tu catálogo musical distribuido
            </p>
          </div>

          <Link
            href="/dashboard/releases/new"
            className="btn btn-primary"
          >
            Nuevo Lanzamiento
          </Link>
        </div>

        {releases.length === 0 ? (
          <div className="text-center pt-xl pb-xl text-muted">
            <p>Aún no tienes lanzamientos.</p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.8rem",
              marginTop: "1.5rem",
            }}
          >
            {releases.map((release) => (
              <div
                key={release.id}
                className="glass-panel"
                style={{
                  padding: "1.1rem 1.4rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 style={{ margin: 0 }}>
                      {release.title}
                    </h4>
                    <p className="text-sm text-muted mt-sm">
                      Fecha de lanzamiento:{" "}
                      {new Date(
                        release.releaseDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    {getStatusBadge(release)}

                    {/* EDITABLE / ELIMINABLE */}
{(
  release.status === "DRAFT" ||
  release.status === "REJECTED" ||
  release.status === "AWAITING_SIGNATURE"
) && (
  <>
    {/* Solo editable si es DRAFT o REJECTED */}
    {(release.status === "DRAFT" ||
      release.status === "REJECTED") && (
      <Link
        href={`/dashboard/releases/${release.id}/edit`}
        className="btn btn-secondary"
        style={{
          padding: "6px 12px",
          fontSize: "0.8rem",
        }}
      >
        Editar
      </Link>
    )}

    <DeleteReleaseButton releaseId={release.id} />
  </>
)}

                    {/* FIRMAR CONTRATO */}
                    {release.status === "AWAITING_SIGNATURE" && (
                      <Link
                        href={`/dashboard/releases/${release.id}/sign`}
                        className="btn btn-primary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                        }}
                      >
                        Firmar contrato
                      </Link>
                    )}
                  </div>
                </div>

                {release.status === "REJECTED" &&
                  release.rejectionReason && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "10px",
                        background:
                          "rgba(239, 68, 68, 0.05)",
                        border:
                          "1px solid rgba(239, 68, 68, 0.2)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <strong>Motivo:</strong>{" "}
                      {release.rejectionReason}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}