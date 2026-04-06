import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function TermsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { artist: true },
  });

  if (!user?.artist) redirect("/dashboard");

  const artistName = user.name;
  const today = new Date().toLocaleDateString("es-ES");

  return (
    <div className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-3xl)" }}>
      <div className="glass-panel" style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <h1 className="text-gradient">Contrato de Distribución Digital</h1>
          <p className="text-muted">
            En Madrid, a {today}
          </p>
        </div>

        {/* Reunidos */}
        <section className="flex-col gap-md mb-xl">
          <h3 className="text-secondary">REUNIDOS</h3>

          <p>
            De una parte, <strong>HIT STAR S.L.</strong>, con domicilio en Madrid, España,
            representada por <strong>Pedro Miguel Trula</strong>, DNI 72171345J,
            en adelante <strong>“HIT STAR”</strong>.
          </p>

          <p>
            De otra parte, <strong>{artistName}</strong>, en adelante
            <strong> “EL TITULAR”</strong>, quien actúa en su propio nombre
            y declara ser <strong>Productor Fonográfico</strong> y titular exclusivo
            de todos los derechos de explotación sobre las grabaciones que entregue
            para su distribución.
          </p>
        </section>

        {/* Manifiestan */}
        <section className="flex-col gap-md mb-xl">
          <h3 className="text-secondary">MANIFIESTAN</h3>

          <p>
            I. Que EL TITULAR es propietario exclusivo del 100% de los derechos
            de propiedad intelectual, derechos fonográficos y derechos de explotación
            sobre las grabaciones sonoras y audiovisuales que entregue.
          </p>

          <p>
            II. Que EL TITULAR ostenta la condición de Productor Fonográfico
            conforme a la legislación española vigente.
          </p>

          <p>
            III. Que HIT STAR es una plataforma tecnológica dedicada a la
            distribución digital de contenidos musicales en plataformas
            digitales.
          </p>

          <p>
            IV. Que ambas partes desean formalizar el presente contrato
            de distribución digital.
          </p>
        </section>

        {/* Cláusulas */}
        <section className="flex-col gap-lg">

          <div>
            <h2 className="text-gradient">1. Objeto</h2>
            <p>
              EL TITULAR concede a HIT STAR una licencia digital no exclusiva,
              mundial y temporal para distribuir, comunicar públicamente,
              poner a disposición del público y monetizar las grabaciones
              entregadas en plataformas digitales como Spotify, Apple Music,
              YouTube, Amazon Music, Deezer y otras.
            </p>
            <p>
              En ningún caso el presente contrato implica cesión de propiedad.
              La titularidad de las grabaciones permanecerá en todo momento
              al 100% en favor de EL TITULAR.
            </p>
          </div>

          <div>
            <h2 className="text-gradient">2. Duración</h2>
            <p>
              El presente contrato tendrá una duración inicial de un (1) año,
              renovable automáticamente por períodos iguales salvo notificación
              en contrario con 30 días de antelación.
            </p>
          </div>

          <div>
            <h2 className="text-gradient">3. Contraprestación</h2>
            <p>
              HIT STAR abonará a EL TITULAR el <strong>80%</strong> de los ingresos netos
              efectivamente percibidos por la explotación digital de las grabaciones.
            </p>
            <p>
              HIT STAR retendrá un <strong>20%</strong> en concepto de comisión
              por servicios de distribución, gestión técnica y administrativa.
            </p>
          </div>

          <div>
            <h2 className="text-gradient">4. Liquidaciones</h2>
            <p>
              Las liquidaciones se realizarán trimestralmente dentro de los 45 días
              posteriores al cierre de cada trimestre natural.
            </p>
            <p>
              EL TITULAR podrá solicitar auditoría anual a su cargo.
            </p>
          </div>

          <div>
            <h2 className="text-gradient">5. Garantías e Indemnidad</h2>
            <p>
              EL TITULAR garantiza ser titular legítimo de los derechos
              sobre las grabaciones y mantendrá indemne a HIT STAR frente
              a cualquier reclamación de terceros.
            </p>
          </div>

          <div>
            <h2 className="text-gradient">6. Protección de Datos</h2>
            <p>
              Ambas partes se comprometen a cumplir el Reglamento General
              de Protección de Datos (RGPD) y la normativa española vigente.
            </p>
          </div>

          <div>
            <h2 className="text-gradient">7. Jurisdicción</h2>
            <p>
              El presente contrato se regirá por la legislación española.
              Las partes se someten a los Juzgados y Tribunales de Madrid.
            </p>
          </div>

        </section>

        {/* Firmas */}
        <div style={{ marginTop: "var(--spacing-3xl)" }}>
          <div className="grid grid-cols-2 gap-xl">
            <div>
              <p className="text-secondary">HIT STAR S.L.</p>
              <p>Pedro Miguel Trula</p>
            </div>

            <div>
              <p className="text-secondary">EL TITULAR</p>
              <p>{artistName}</p>
            </div>
          </div>
        </div>
        <div
  style={{
    marginTop: "var(--spacing-3xl)",
    display: "flex",
    justifyContent: "center",
  }}
>
  <a
    href="/api/contracts"
    className="btn btn-primary"
    style={{
      padding: "1rem 2.5rem",
      fontSize: "var(--text-base)",
      boxShadow: "var(--shadow-glow)",
    }}
  >
    Descargar contrato en PDF
  </a>
</div>

      </div>
    </div>
  );
}