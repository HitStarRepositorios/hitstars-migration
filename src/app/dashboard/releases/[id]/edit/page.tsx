import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import InfoStep from "./InfoStep";
import CoverStep from "./CoverStep";
import dynamic from "next/dynamic";

import TracksStep from "./TracksStep";
import CreditsStep from "./CreditsStep";
import DistributionStep from "./DistributionStep";
import ReviewStep from "./ReviewStep";
import { ReleaseStatus } from "@prisma/client";

const steps = [
  { key: "info", label: "Información" },
  { key: "cover", label: "Portada" },
  { key: "tracks", label: "Tracks" },
  { key: "credits", label: "Créditos" },
  { key: "distribution", label: "Distribución" },
  { key: "review", label: "Revisión" },
];

const ALL_REGIONS = [
  "EUROPE",
  "LATAM",
  "NORTH_AMERICA",
  "ASIA",
  "AFRICA",
  "OCEANIA",
];

export default async function EditReleasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { id } = await params;
  const { step } = await searchParams;

  const currentStep = step || "info";

  const session = await getSession();
  if (!session) redirect("/");

const release = await prisma.release.findUnique({
  where: { id },
  include: {
    artist: {
      include: {
        user: true
      }
    },
    releaseArtists: true,
    tracks: {
      include: {
        masterParties: true,
        publishingCredits: true,
        artists: true,
        segments: true
      }
    }
  }
})

if (!release) {
  notFound();
}

const editableStatuses: ReleaseStatus[] = [
  ReleaseStatus.DRAFT,
  ReleaseStatus.REJECTED,
];

if (!editableStatuses.includes(release.status)) {
  let message = "Este lanzamiento no puede editarse.";

  if (release.status === ReleaseStatus.PENDING) {
    message = "Este lanzamiento está en revisión editorial.";
  }

  if (release.status === ReleaseStatus.CONTRACT_GENERATED) {
    message = "Este lanzamiento ya tiene contrato generado.";
  }

  if (release.status === ReleaseStatus.SIGNED) {
    message = "El contrato ya ha sido firmado.";
  }

  if (release.status === ReleaseStatus.APPROVED) {
    message = "Este lanzamiento ya fue aprobado.";
  }

  return (
    <div className="glass-panel" style={{ marginBottom: "1.5rem" }}>
      <h3>{message}</h3>
      <p className="text-muted">
        Solo los lanzamientos en estado BORRADOR o RECHAZADO pueden modificarse.
      </p>

      <p className="text-muted">
        Estado actual: {release.status}
      </p>

      <Link
        href="/dashboard/releases"
        className="btn btn-primary mt-lg"
      >
        Volver a lanzamientos
      </Link>
    </div>
  );
}

  if (!release.distributionType) {
    return (
      <div className="glass-panel" style={{ marginBottom: "1.5rem" }}>
        <h3>Error de configuración</h3>
        <p className="text-muted">
          Este lanzamiento no tiene tipo asignado.
        </p>
        <Link
          href="/dashboard/releases/new"
          className="btn btn-primary mt-lg"
        >
          Crear nuevo lanzamiento
        </Link>
      </div>
    );
  }

  const type = release.distributionType;

  // VALIDACIONES REVIEW
  const hasCover = !!release.coverUrl;
  const hasTracks = release.tracks.length > 0;

const creditsValid = release.tracks.every((track: any) => {

  const masterParties = track.masterParties || [];
  const publishingCredits = track.publishingCredits || [];

  // MASTER
  if (masterParties.length === 0) return false;

  const masterTotal = masterParties.reduce(
    (sum: number, p: any) =>
      sum + Number(p.ownershipShare || 0),
    0
  );

  if (Math.round(masterTotal) !== 100) return false;

  // PUBLISHING (opcional)
  const publishingTotal = publishingCredits.reduce(
    (sum: number, p: any) =>
      sum + Number(p.share || 0),
    0
  );

  if (publishingCredits.length > 0 && Math.round(publishingTotal) !== 100)
    return false;

  return true;
});

 const selectedPlatforms = Array.isArray(release.distributionPlatforms)
  ? release.distributionPlatforms
  : [];

const selectedTerritories = release.distributionWorldwide
  ? ALL_REGIONS
  : Array.isArray(release.distributionTerritories)
  ? release.distributionTerritories
  : [];

  async function submitAction(formData: FormData) {
    "use server";

    const releaseId = formData.get("releaseId") as string;

    await prisma.release.update({
      where: { id: releaseId },
      data: { status: "PENDING" },
    });

    redirect("/dashboard/releases");
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="glass-panel" style={{ marginBottom: "1.5rem" }}>
        <h2>{release.title || "Nuevo Lanzamiento"}</h2>
        <p className="text-muted">
          Estado: {release.status} • Tipo: {type}
        </p>
      </div>

      {/* Step Navigation */}
      <div className="glass-panel" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            overflowX: "auto",
          }}
        >
          {steps.map((stepItem, index) => {
            const isActive = currentStep === stepItem.key;

            return (
              <Link
                key={stepItem.key}
                href={`/dashboard/releases/${id}/edit?step=${stepItem.key}`}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                  background: isActive
                    ? "linear-gradient(135deg,#6d28d9,#db2777)"
                    : "rgba(255,255,255,0.05)",
                  color: isActive
                    ? "white"
                    : "var(--text-secondary)",
                }}
              >
                {index + 1}. {stepItem.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-panel" style={{ marginBottom: "1.5rem" }}>
        {currentStep === "info" && (
          <InfoStep release={release} />
        )}

        {currentStep === "cover" && (
          <CoverStep release={release} />
        )}

        {currentStep === "tracks" && (
          <TracksStep
            release={release}
            maxTracks={
              type === "SINGLE"
                ? 1
                : type === "EP"
                ? 6
                : undefined
            }
          />
        )}

        {currentStep === "credits" && (
          <CreditsStep release={release} />
        )}

        {currentStep === "distribution" && (
          <DistributionStep release={release} />
        )}

        {currentStep === "review" && (
<ReviewStep
  release={release}
selectedPlatforms={
  Array.isArray(release.distributionPlatforms)
    ? (release.distributionPlatforms as string[])
    : []
}
selectedTerritories={
  release.distributionWorldwide
    ? ALL_REGIONS
    : Array.isArray(release.distributionTerritories)
    ? (release.distributionTerritories as string[])
    : []
}
  creditsValid={creditsValid}
  hasCover={hasCover}
  hasTracks={hasTracks}
  submitAction={submitAction}
/>
        )}
      </div>
    </div>
  );
}