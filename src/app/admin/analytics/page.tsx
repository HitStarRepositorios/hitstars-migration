export default function AdminAnalyticsPage() {
    return (
        <div className="flex-col gap-lg">
            <div className="glass-panel">
                <h2>Monetización y Análisis (Demo)</h2>
                <p className="text-muted">Integra aquí los reportes CSV de tiendas y entidades de gestión (SGAE / AGEDI).</p>
            </div>

            <div className="grid grid-cols-3 gap-lg">
                <div className="glass-panel flex-col items-center justify-center text-center">
                    <p className="text-secondary text-sm">Ingresos Brutos Spotify</p>
                    <h2 className="text-gradient mt-sm">€ 14,502.50</h2>
                    <p className="text-success text-xs mt-xs">+12% este mes</p>
                </div>
                <div className="glass-panel flex-col items-center justify-center text-center">
                    <p className="text-secondary text-sm">Recaudación SGAE (Mecánicos)</p>
                    <h2 className="text-gradient mt-sm">€ 3,450.00</h2>
                    <p className="text-muted text-xs mt-xs">Trimestre Q3</p>
                </div>
                <div className="glass-panel flex-col items-center justify-center text-center">
                    <p className="text-secondary text-sm">Recaudación AGEDI (Master)</p>
                    <h2 className="text-gradient mt-sm">€ 8,210.00</h2>
                    <p className="text-muted text-xs mt-xs">Trimestre Q3</p>
                </div>
            </div>

            <div className="glass-panel mt-md">
                <h3>Subir Reportes de Ventas</h3>
                <p className="text-muted mb-md text-sm">
                    Sube los archivos TSV/CSV proporcionados por las plataformas digitales para mapear los ingresos a los ISRCs de los artistas.
                </p>

                <form className="flex gap-md items-center">
                    <select className="form-input" style={{ width: "200px" }}>
                        <option>Spotify (Mensual)</option>
                        <option>Apple Music (Mensual)</option>
                        <option>YouTube Content ID</option>
                        <option>SGAE / AGEDI</option>
                    </select>
                    <input type="file" className="form-input" style={{ flex: 1 }} accept=".csv,.tsv" />
                    <button type="button" className="btn btn-primary" onClick={() => alert('Función no implementada en la demo')}>
                        Procesar Royalties
                    </button>
                </form>
            </div>
        </div>
    );
}
