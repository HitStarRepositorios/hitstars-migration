"use server";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  approveReleaseAction,
  rejectReleaseAction,
  sendToDistributionAction,
} from "@/app/actions/releases";

export default async function AdminReleaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const release = await prisma.release.findUnique({
    where: { id },
    include: {
      artist: { include: { user: true } },
      tracks: {
        include: {
          masterParties: true,
          publishingCredits: true,
          artists: true,
        },
        orderBy: { trackNumber: "asc" },
      },
    },
  });

  if (!release) return notFound();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* HEADER */}
      <div className="glass-panel">
        <div style={{ display: "flex", gap: "2rem" }}>
          
          {/* COVER */}
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 16,
              overflow: "hidden",
              background: "rgba(255,255,255,0.05)",
              flexShrink: 0,
            }}
          >
            {release.coverUrl && (
              <img
                src={release.coverUrl}
                alt={release.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          {/* INFO */}
          <div style={{ flex: 1 }}>
            <h2>{release.title}</h2>

            <p className="text-secondary">
              Por {release.artist.user.name ?? release.artist.user.email}
            </p>

            <p className="text-muted">
              Sello: {release.label} • Fecha:{" "}
              {new Date(release.releaseDate).toLocaleDateString()}
            </p>

            <p className="text-muted">
              Estado: {release.status}
            </p>
          </div>
        </div>
      </div>

      {/* TRACKS */}
      <div className="glass-panel">
        <h3>Tracks</h3>

        {release.tracks.map((track) => (
          <div
            key={track.id}
            style={{
              marginTop: "2rem",
              paddingTop: "2rem",
              borderTop: "var(--glass-border)",
            }}
          >
            <h4>
              {track.trackNumber}. {track.title}
              {track.explicit && (
                <span style={{ color: "var(--error)", marginLeft: 8 }}>
                  (E)
                </span>
              )}
            </h4>

            <audio
              controls
              src={track.fileUrl}
              style={{ width: "100%", marginTop: "1rem" }}
            />

            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.85rem",
                opacity: 0.8,
              }}
            >
              <p>Instrumental: {track.isInstrumental ? "Sí" : "No"}</p>
            </div>

            {track.lyrics && (
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                }}
              >
                <h5>Letra</h5>
                <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                  {track.lyrics}
                </p>
              </div>
            )}

            {/* MASTER */}
            {track.masterParties.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <strong>MASTER</strong>

                {track.masterParties.map((party) => (
                  <div
                    key={party.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      marginTop: "0.3rem",
                    }}
                  >
                    <span>
                      {party.legalName} ({party.role})
                    </span>
                    <span>{party.ownershipShare}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* PUBLISHING */}
            {track.publishingCredits.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <strong>PUBLISHING</strong>

                {track.publishingCredits.map((credit) => (
                  <div
                    key={credit.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      marginTop: "0.3rem",
                    }}
                  >
                    <span>
                      {credit.firstName} {credit.lastName} ({credit.role})
                    </span>
                    <span>{credit.share}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="glass-panel">
        <h3>Acciones</h3>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1rem",
            alignItems: "center",
            flexWrap: "wrap", // 👈 evita solapamientos
          }}
        >

          {/* RECHAZAR */}
          <form
            action={async (formData) => {
              "use server";
              await rejectReleaseAction(release.id, null, formData);
            }}
            style={{ display: "flex", gap: "0.5rem" }}
          >
            <input
              type="text"
              name="reason"
              placeholder="Motivo del rechazo"
              required
              className="form-input"
              style={{ minWidth: "250px" }}
            />

            <button
              type="submit"
              className="btn btn-secondary"
              style={{
                borderColor: "var(--error)",
                color: "var(--error)",
              }}
            >
              Rechazar
            </button>
          </form>

          {/* APROBAR */}
          <form
            action={async () => {
              "use server";
              await approveReleaseAction(release.id);
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: "var(--success)",
                boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
              }}
            >
              Aprobar
            </button>
          </form>

          {/* ENVIAR A DISTRIBUCIÓN */}
          {release.status === "SIGNED" && (
            <form
              action={async () => {
                "use server";
                await sendToDistributionAction(release.id);
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  background: "var(--accent-primary)",
                }}
              >
                🚀 Enviar a distribución
              </button>
            </form>
          )}

          {/* SIMULAR DSP */}
          {release.status === "DISTRIBUTING" && (
            <form
              action={async () => {
                "use server";

                await fetch(
                  `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/dsp`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      releaseId: release.id,
                      status: "LIVE",
                    }),
                  }
                );
              }}
            >
              <button className="btn btn-secondary">
                🎧 Simular LIVE (DSP)
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}