export function generateContractHtml(release: any) {
  const today = new Date().toLocaleDateString("es-ES");

  let html = `
    <h3>CONTRATO DE LICENCIA DE DISTRIBUCIÓN DIGITAL</h3>
    <p>En Madrid, a ${today}</p>

    <h4>1. OBJETO</h4>
    <p>
      EL TITULAR concede licencia digital no exclusiva,
      mundial y temporal a HIT STAR S.L.
      para la explotación digital de los fonogramas.
    </p>

    <h4>2. DURACIÓN</h4>
    <p>Cinco (5) años renovables automáticamente.</p>

    <h4>3. CONTRAPRESTACIÓN</h4>
    <p>
      HIT STAR retendrá un 10% de los ingresos netos.
      El 90% restante será distribuido conforme
      a los porcentajes MASTER declarados.
    </p>

    <h4>ANEXO I – REPARTO MASTER</h4>
  `;

  release.tracks.forEach((track: any) => {
    html += `<p><strong>${track.title}</strong></p>`;

    const masterSplits = track.splits.filter(
      (s: any) => s.type === "MASTER"
    );

    masterSplits.forEach((split: any) => {
      html += `<p>${split.name} — ${split.percentage}%</p>`;
    });
  });

  return html;
}