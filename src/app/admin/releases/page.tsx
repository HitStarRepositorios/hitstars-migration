"use server";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminReleasesPage() {
  const pendingReleases = await prisma.release.findMany({
    where: { status: "PENDING" },
    include: {
      artist: {
        include: { user: true },
      },
      tracks: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-lg">
      {/* HEADER */}
      <div className="glass-panel">
        <h2>Revisión de Lanzamientos</h2>
        <p className="text-muted">
          Revisa en detalle los envíos antes de aprobarlos o rechazarlos.
        </p>
      </div>

      {pendingReleases.length === 0 ? (
        <div className="text-center pt-xl pb-xl text-muted glass-panel">
          <p>No hay lanzamientos pendientes de revisión. ¡Todo al día!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-lg">
          {pendingReleases.map((release) => (
            <div key={release.id} className="glass-panel">
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* LEFT SIDE */}
                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "center",
                  }}
                >
                  {/* COVER */}
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.05)",
                      flexShrink: 0,
                    }}
                  >
                    {release.coverUrl ? (
                      <img
                        src={release.coverUrl}
                        alt={release.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>

                  {/* INFO */}
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {release.title}
                    </h3>

                    <p className="text-secondary mt-sm">
                      Por{" "}
                      {release.artist.user.name ??
                        release.artist.user.email}
                    </p>

                    <p className="text-sm text-muted">
                      Sello: {release.label} • Fecha:{" "}
                      {new Date(
                        release.releaseDate
                      ).toLocaleDateString()}{" "}
                      • {release.tracks.length} track(s)
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "#f59e0b",
                      fontWeight: 600,
                    }}
                  >
                    PENDING
                  </span>

                  <Link
                    href={`/admin/releases/${release.id}`}
                    className="btn btn-primary"
                    style={{
                      padding: "0.6rem 1.2rem",
                    }}
                  >
                    Revisar
                  </Link>
                </div>
              </div>

              {/* TRACK PREVIEW SUMMARY */}
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "var(--glass-border)",
                }}
              >
                <h5 className="text-muted mb-sm">
                  Tracks
                </h5>

                {release.tracks.map((track) => (
                  <div
                    key={track.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <span>
                      {track.trackNumber}. {track.title}{" "}
                      {track.explicit && (
                        <span style={{ color: "var(--error)" }}>
                          (E)
                        </span>
                      )}
                    </span>

                    <span className="text-muted">
                      {track.duration
                        ? `${Math.floor(
                            track.duration / 60
                          )}:${String(
                            track.duration % 60
                          ).padStart(2, "0")}`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}