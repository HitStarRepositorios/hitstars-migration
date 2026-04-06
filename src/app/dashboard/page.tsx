import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ArtistOnboardingForm from "./ArtistOnboardingForm";
import ArtistProfileEdit from "./ArtistProfileEdit";
import Image from "next/image";
import { Platform } from "@prisma/client";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) {
    return (
        <div style={{ padding: 40, color: "white" }}>
            No session found in page
        </div>
    );
}

const user = await prisma.user.findUnique({
  where: { id: session.id },
include: {
  artist: {
    include: {
      platforms: true, // 🔥 NECESARIO
    },
  },
  payoutProfile: true,
  kyc: true,
},
});

const ALL_PLATFORMS = [
  { key: "SPOTIFY", label: "Spotify", logo: "/logos/spotify.png" },
  { key: "APPLE_MUSIC", label: "Apple Music", logo: "/logos/applemusic.svg" },
  { key: "YOUTUBE", label: "YouTube", logo: "/logos/youtubemusic.png" },
  { key: "TIKTOK", label: "TikTok", logo: "/logos/tiktok.png" },
  { key: "INSTAGRAM", label: "Instagram", logo: "/logos/instagram.png" },
  { key: "SOUNDCLOUD", label: "Soundcloud", logo: "/logos/soundcloud.png" },
  { key: "AMAZON", label: "Amazon", logo: "/logos/amazonmusic.png" },
];

if (!user) {
    return (
        <div style={{ padding: 40, color: "white" }}>
            User not found in database
        </div>
    );
}

const connected =
  user.artist?.platforms?.map((p) => p.platform) || [];

    if (!user?.artist) {
        return (
            <div className="glass-panel">
                <h2>Bienvenido a Hit Star, {user?.name}</h2>
                <p className="text-muted mb-lg">Antes de distribuir música, necesitamos configurar tu perfil de artista o sello.</p>
                <ArtistOnboardingForm />
            </div>
        );
    }

    /*
    -------------------------------------------------------
    STATS AGGREGATION (Phase 41)
    -------------------------------------------------------
    */

    // 1. Total de Lanzamientos
    const releaseCount = await prisma.release.count({
      where: { artistId: user.artist.id }
    })

    // 2. Royalties Disponibles
    const transactions = await prisma.royaltyTransaction.findMany({
      where: { userId: user.id },
      select: { amount: true, type: true, status: true }
    })

    const balanceTotal = transactions
      .filter(t => t.type === "ROYALTY" && t.status === "AVAILABLE")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const balancePaid = transactions
      .filter(t => t.type === "WITHDRAWAL" && t.status === "PAID")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const balancePending = transactions
      .filter(t => t.type === "WITHDRAWAL" && t.status === "PENDING")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const availableBalance = balanceTotal - (balancePaid + balancePending)

    return (
  <div className="flex flex-col gap-lg">

    {/* HEADER */}
    <div className="glass-panel">
      <h2>Resumen de Artista</h2>
      <p className="text-muted">
        Hola, {user.name}. Aquí tienes un resumen de tu actividad reciente.
      </p>

      {/* BIO & GENRE EDIT */}
      <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
        <ArtistProfileEdit 
          initialBio={user.artist.bio} 
          initialGenre={user.artist.genre} 
          initialSubGenre={user.artist.subGenre} 
        />
      </div>
    </div>

<div
  className="glass-panel"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "2rem",
    flexWrap: "wrap",
  }}
>
  <div>
    <h3 style={{ marginBottom: "0.75rem" }}>
      Plataformas
    </h3>

    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      {ALL_PLATFORMS.map((platform) => {
        const isConnected = connected.includes(platform.key as Platform);

        return (
          <div
            key={platform.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.8rem",
              borderRadius: "999px",
              background: isConnected
                ? "rgba(34,197,94,0.12)"
                : "rgba(255,255,255,0.05)",
              border: isConnected
                ? "1px solid rgba(34,197,94,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              fontSize: "0.85rem",
            }}
          >
            <Image
              src={platform.logo}
              alt={platform.label}
              width={16}
              height={16}
            />
            <span>
              {platform.label}
              {isConnected ? " ✓" : ""}
            </span>
          </div>
        );
      })}
    </div>

    <p className="text-muted mt-sm">
      {connected.length}/{ALL_PLATFORMS.length} conectadas
    </p>
  </div>

  <Link
    href="/dashboard/settings/platforms"
    className="btn btn-primary"
  >
    Gestionar →
  </Link>
</div>
    

    {/* 🏦 BLOQUE CONFIGURACIÓN DE PAGOS */}
{user.kyc?.status === "APPROVED" && (
  <div className="glass-panel">
    {!user.payoutProfile ? (
      <>
        <h3>Configura tu método de pago</h3>
        <p className="text-muted">
          Para poder retirar tus royalties debes añadir una cuenta bancaria.
        </p>

        <div style={{ marginTop: "1rem" }}>
          <Link href="/dashboard/payout" className="btn btn-primary">
            Configurar ahora
          </Link>
        </div>
      </>
    ) : (
      <>
        <h3>Datos de facturación</h3>

        <div style={{ marginTop: "1rem" }}>
          <p className="text-muted">
            Titular: <strong>{user.payoutProfile.accountHolderName}</strong>
          </p>

          <p className="text-muted">
            IBAN:{" "}
            <strong>
              {user.payoutProfile.iban?.slice(0, 4)} ****{" "}
              {user.payoutProfile.iban?.slice(-4)}
            </strong>
          </p>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/dashboard/payout" className="btn btn-secondary">
            Cambiar detalles de facturación
          </Link>
        </div>
      </>
    )}
  </div>
)}

    

    {/* STATS GRID */}
    <div className="grid grid-cols-2 gap-lg">
      <div className="glass-panel flex-col items-center text-center">
        <h3>Total de Lanzamientos</h3>
        <h1
          className="text-gradient mt-md"
          style={{ fontSize: "var(--text-5xl)" }}
        >
          {releaseCount}
        </h1>
        <Link
          href="/dashboard/releases/new"
          className="btn btn-primary mt-lg"
        >
          Subir Lanzamiento
        </Link>
      </div>

      <div className="glass-panel flex-col items-center text-center">
        <h3>Royalties Pendientes</h3>
        <h1
          className="text-gradient mt-md"
          style={{ fontSize: "var(--text-5xl)" }}
        >
          €{availableBalance.toFixed(2)}
        </h1>
        <Link
          href="/dashboard/analytics"
          className="btn btn-secondary mt-lg"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  </div>
);
}


