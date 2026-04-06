import { prisma } from "@/lib/prisma";

export default async function AdminArtistsPage() {
    const artists = await prisma.artist.findMany({
        include: {
            user: true,
            _count: {
                select: { releases: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex-col gap-lg">
            <div className="glass-panel">
                <h2>Directorio de Artistas</h2>
                <p className="text-muted">Todos los artistas y sellos registrados en la plataforma.</p>
            </div>

            <div className="grid grid-cols-2 gap-md">
                {artists.map(artist => (
                    <div key={artist.id} className="glass-panel glass-panel-interactive">
                        <h3 className="text-gradient" style={{ margin: "0 0 var(--spacing-sm) 0" }}>
                            {artist.user.name || artist.user.email}
                        </h3>
                        <p className="text-sm text-secondary mb-sm">{artist.genre} • {artist._count.releases} Lanzamientos</p>
                        <p className="text-sm pt-sm" style={{ borderTop: "var(--glass-border)" }}>{artist.bio?.substring(0, 100)}...</p>

                        {(artist.spotifyId || artist.appleId) && (
                            <div className="flex gap-sm mt-md text-xs text-muted">
                                {artist.spotifyId && <span>Spotify ID: {artist.spotifyId}</span>}
                                {artist.appleId && <span>Apple ID: {artist.appleId}</span>}
                            </div>
                        )}
                    </div>
                ))}
                {artists.length === 0 && (
                    <p className="text-muted">No hay artistas registrados aún.</p>
                )}
            </div>
        </div>
    );
}
