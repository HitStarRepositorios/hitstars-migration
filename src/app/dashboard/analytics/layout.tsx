import Link from "next/link"

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <div className="flex flex-col gap-lg">

      <div className="glass-panel">

        <h2>Analytics</h2>
        <p className="text-muted">
          Estadísticas de ingresos y audiencia.
        </p>

        {/* TABS */}

        <div
          style={{
            display:"flex",
            gap:"0.6rem",
            marginTop:"1rem",
            flexWrap:"wrap"
          }}
        >

          <Link href="/dashboard/analytics" className="btn btn-secondary">
            Resumen
          </Link>

          <Link href="/dashboard/analytics/master" className="btn btn-secondary">
            Master
          </Link>

          <Link href="/dashboard/analytics/publishing" className="btn btn-secondary">
            Publishing
          </Link>

          <Link href="/dashboard/analytics/producer" className="btn btn-secondary">
            Producer
          </Link>

          <Link href="/dashboard/analytics/audience" className="btn btn-secondary">
            Audiencias
          </Link>

          <Link href="/dashboard/analytics/movements" className="btn btn-secondary">
            Movimientos
          </Link>

        </div>

      </div>

      {children}

    </div>

  )

}