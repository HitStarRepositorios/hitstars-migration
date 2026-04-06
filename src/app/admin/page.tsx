import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProcessRoyaltiesBtn from "./ProcessRoyaltiesBtn";

export default async function AdminDashboardPage() {
    // 1. Usuarios (Conteo directo de IDs para evitar fallos de filtrado)
    const allUsersCount = await prisma.user.count();
    const totalUsers = Math.max(0, allUsersCount - 1); // Restamos el admin (tú)

    // 2. Lanzamientos
    const pendingReleases = await prisma.release.count({ where: { status: 'PENDING' } });
    const distributedReleases = await prisma.release.count({ 
        where: { status: { in: ['LIVE', 'DISTRIBUTING'] } } 
    });

    // 3. Ingresos Plataforma (El 10% de TODO el flujo de dinero)
    const [masterUsage, producerUsage, publishingUsage] = await Promise.all([
        prisma.royaltyUsage.aggregate({ _sum: { revenue: true } }),
        prisma.producerReport.aggregate({ _sum: { revenue: true } }),
        prisma.publishingReport.aggregate({ _sum: { revenue: true } })
    ]);

    const totalRevenue = 
        (masterUsage._sum.revenue || 0) + 
        (producerUsage._sum.revenue || 0) + 
        (publishingUsage._sum.revenue || 0);

    const platformIncome = totalRevenue * 0.10;

    return (
        <div className="flex flex-col gap-lg">
            <div className="glass-panel">
                <h2>Panel de Control</h2>
                <p className="text-muted">Resumen del estado de Hit Star Distribución.</p>
            </div>

            <div className="grid gap-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                
                {/* USUARIOS */}
                <div className="glass-panel flex flex-col items-center text-center">
                    <span className="text-muted text-sm uppercase tracking-wider">Usuarios Registrados</span>
                    <h1 className="text-gradient mt-sm" style={{ fontSize: "var(--text-4xl)" }}>{totalUsers}</h1>
                </div>

                {/* LANZAMIENTOS LIVE */}
                <div className="glass-panel flex flex-col items-center text-center">
                    <span className="text-muted text-sm uppercase tracking-wider">Lanzamientos en Tiendas</span>
                    <h1 className="text-blue-400 mt-sm" style={{ fontSize: "var(--text-4xl)" }}>{distributedReleases}</h1>
                </div>

                {/* INGRESOS PLATAFORMA */}
                <div className="glass-panel flex flex-col items-center text-center" style={{ border: "1px solid var(--accent)" }}>
                    <span className="text-muted text-sm uppercase tracking-wider">Ingresos Plataforma (10%)</span>
                    <h1 className="text-green-400 mt-sm" style={{ fontSize: "var(--text-4xl)" }}>€{platformIncome.toFixed(2)}</h1>
                </div>

            </div>

            <div className="grid gap-lg" style={{ gridTemplateColumns: "1fr 1fr" }}>
                
                {/* LANZAMIENTOS PENDIENTES */}
                <div className="glass-panel flex flex-col items-center text-center" style={{ borderColor: pendingReleases > 0 ? "var(--warning)" : "var(--glass-border)" }}>
                    <h3>Lanzamientos Pendientes</h3>
                    <h1 className="text-warning mt-md" style={{ fontSize: "var(--text-4xl)" }}>{pendingReleases}</h1>
                    {pendingReleases > 0 && (
                        <Link href="/admin/releases" className="btn btn-secondary mt-lg">Revisar Ahora</Link>
                    )}
                </div>

                {/* MÓDULO DE ROYALTIES */}
                <div className="glass-panel">
                    <h3 className="mb-md">💰 Gestión de Royalties</h3>
                    <p className="text-muted mb-lg">
                        Procesa los informes de R2 y distribuye los fondos a los artistas.
                    </p>
                    <ProcessRoyaltiesBtn />
                </div>

            </div>
        </div>
    );
}

