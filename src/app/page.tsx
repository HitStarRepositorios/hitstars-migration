import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="bg-mesh"></div>

      <main
        className="container flex-col items-center justify-center pt-xl pb-xl"
        style={{ minHeight: "100vh", display: "flex" }}
      >
        <div className="text-center animate-fade-in mb-xl">

          {/* LOGO */}
          <div className="logo-float">
            <Image
              src="/hitstar.png"
              alt="Hit Star Logo"
              width={140}
              height={140}
              priority
              style={{
                margin: "0 auto",
                filter: "drop-shadow(0 10px 40px rgba(168,85,247,0.6))",
              }}
            />
          </div>

          <h1 className="text-gradient">Hit Star</h1>

          <p
            className="text-secondary text-xl mt-sm"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            Distribuye tu música a nivel mundial. Llega a Spotify, Apple Music,
            YouTube, VEVO, Deezer y más plataformas en unos pocos clics.
          </p>
        </div>

        <div
          className="glass-panel glass-panel-interactive flex-col items-center text-center animate-fade-in animate-delay-1"
          style={{ width: "100%", maxWidth: "600px" }}
        >
          <h3>Portal de Artistas</h3>

          <p className="text-muted mb-lg mt-sm">
            Sube tus canciones, gestiona tus metadatos y revisa tus ingresos
            royalties automáticamente desde un único panel.
          </p>

          <div className="flex flex-mobile-col gap-md" style={{ width: "100%" }}>
            <Link href="/login" className="btn btn-secondary btn-block">
              Inicia Sesión
            </Link>

            <Link href="/register" className="btn btn-primary btn-block">
              Regístrate
            </Link>
          </div>
        </div>

        <footer className="mt-xl text-muted text-sm animate-fade-in animate-delay-2">
          &copy; {new Date().getFullYear()} Hit Star Digital Distributor.
          Todos los derechos reservados.
        </footer>
      </main>
    </>
  );
}