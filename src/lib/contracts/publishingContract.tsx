
export function getPublishingContractText({
  release,
  artistName,
  legalName,
  dni,
  address,
  territory,
  today,
}: {
  release: any;
  artistName: string;
  legalName: string;
  dni: string;
  address: string;
  territory: string;
  today: string;
}) {
const blocks: any[] = [

    // ================= PORTADA =================

    { type: "center", text: "HIT STAR S.L." },
    { type: "center", text: "CONTRATO DE GESTIÓN EDITORIAL" },

    {
      type: "paragraph",
      text: `En Madrid, a ${today}, las partes abajo firmantes celebran el presente contrato entre HIT STAR S.L. y ${artistName}.`
    },

    // ================= PARTES =================

    { type: "title", text: "PARTES" },

    {
      type: "paragraph",
      text: "De una parte, HIT STAR S.L., sociedad de responsabilidad limitada constituida conforme a la legislación española con CIF 72171345J, con domicilio social en Calle Ferroviarios 14, Comunidad de Madrid, Madrid, inscrita en el Registro Mercantil correspondiente, representada en este acto por su representante legal con facultades suficientes (en adelante, “HIT STAR”)."
    },

    {
      type: "paragraph",
      text: `Y de otra parte, D./Dª ${legalName}, mayor de edad, con DNI/NIE ${dni} con domicilio en ${address}, actuando en su propio nombre y derecho (en adelante, el “INTÉRPRETE”). Ambas partes, en adelante denominadas conjuntamente las “PARTES”, se reconocen capacidad legal suficiente para contratar y obligarse y, a tal efecto`
    },

    // ================= EXPONEN =================

    { type: "title", text: "I. OBJETO" },

    {
      type: "paragraph",
      text: "1.1. El AUTOR otorga a HIT STAR mandato de gestión editorial para la administración, gestión, recaudación y explotación económica de las OBRAS."
    },

    {
      type: "paragraph",
      text:  "1.2. El presente contrato constituye un contrato de gestión y administración, no implicando en ningún caso cesión de la titularidad de los derechos de propiedad intelectual."
    },

    {
      type: "paragraph",
      text: "1.3. La titularidad de las OBRAS permanecerá en todo momento en el patrimonio del AUTOR."
    },

    

    // ================= ALCANCE DE LA GESTÓN =================

    { type: "title", text: "II. ALCANCE DE LA GESTÓN" },

    {
      type: "paragraph",
      text: "2.1. El mandato conferido incluye:"
    },

    {
      type: "paragraph",
      text:  "     a) Gestión ante entidades de gestión colectiva."
    },
    {
      type: "paragraph",
      text:  "     b) Recaudación de derechos de reproducción y comunicación pública."
    },
    {
      type: "paragraph",
      text:  "     c) Gestión de sincronizaciones audiovisuales."
    },
    {
      type: "paragraph",
      text:  "     d) Concesión de sublicencias editoriales cuando resulte necesario."
    },
    {
      type: "paragraph",
      text:  "     e) Recaudación de derechos derivados de explotación digital." 
    },

// ================= TERRITORIO =================

    { type: "title", text: "III. TERRITORIO" },

    {
      type: "paragraph",
      text: `3.1 La explotación se realizará en: ${territory}.`
    },

  {
      type: "paragraph",
      text:   `3.2 La gestión podrá realizarse directa o indirectamente en dicho territorio.`
    },


    // ================= DURACIÓN =================

    { type: "title", text: "IV. DURACIÓN" },

    {
      type: "paragraph",
      text: `4.1. El presente contrato tendrá una duración de dos (2) años desde su firma.`
    },

    {
      type: "paragraph",
      text: `4.2 Transcurrido el plazo inicial de un (2) años, el contrato se renovará automáticamente por períodos sucesivos de un (2) años, salvo que cualquiera de las partes notifique fehacientemente a la otra su voluntad de no renovarlo con una antelación mínima de tres (3) meses a la fecha de finalización del período en curso. En caso de que las partes suscriban un nuevo contrato, el presente acuerdo cesará automáticamente en su vigencia, sin que resulte aplicable la renovación automática prevista en esta cláusula.`
    },

    // ================= CONTRAPRESTACIÓN =================

    { type: "title", text: "V. CONTRAPRESTACIÓN" },

    {
      type: "paragraph",
      text: `5.1. Como remuneración por los servicios prestados, HIT STAR percibirá el diez por ciento (10%) de los ingresos netos efectivamente percibidos derivados de la explotación editorial de las OBRAS.`
    },

    {
      type: "paragraph",
      text:  `5.2. Se entenderá por ingresos netos las cantidades efectivamente cobradas, una vez deducidos:`
    },

        {
      type: "paragraph",
      text: "     a) Comisiones de subeditores o agentes."
    },

            {
      type: "paragraph",
      text: "     b) Comisiones de entidades de gestión."
    },

                {
      type: "paragraph",
      text: "     c) Impuestos indirectos aplicables."
    },


    // ================= LIQUIDACIÓN Y PAGO =================

    { type: "title", text: "VI. LIQUIDACIÓN Y PAGO" },

    {
      type: "paragraph",
      text: "6.1. Las liquidaciones serán SEMESTRALES."
    },

    {
      type: "paragraph",
      text: `6.2. El pago se realizará dentro de los treinta (30) días siguientes a cada liquidación.`
    },

        {
      type: "paragraph",
      text: "6.3. El AUTOR podrá auditar las cuentas una vez por año, previa notificación con treinta (30) días de antelación."
    },

    // ================= DECLARACIONES Y GARANTÍAS=================

    { type: "title", text: "VII. DECLARACIONES Y GARANTÍAS" },

    {
      type: "paragraph",
      text:  `El AUTOR declara y garantiza:`
    },

 {
      type: "paragraph",
      text:`7.1. Que es titular legítimo de los derechos de autor sobre las OBRAS.`
    },

     {
      type: "paragraph",
      text: "7.2. Que no existen cesiones, gravámenes ni compromisos que impidan la presente gestión."
    },

         {
      type: "paragraph",
      text: "7.3. Que las OBRAS no infringen derechos de terceros."
    },

             {
      type: "paragraph",
      text: "7.4. Que ha obtenido las autorizaciones necesarias de coautores, en su caso."
    },

  // =====================================================
  // ENTREGA Y RESPONSABILIDAD
  // =====================================================


      { type: "title", text: "VIII. INDEMNIDAD" },

    {
      type: "paragraph",
      text:  `8.1. El AUTOR asumirá íntegramente la responsabilidad frente a cualquier reclamación derivada de la titularidad o contenido de las OBRAS.`
    },

 {
      type: "paragraph",
      text:  `8.2. El AUTOR mantendrá indemne a HIT STAR frente a:`
    },

     {
      type: "paragraph",
      text: "     a) Reclamaciones por infracción de derechos."
    },

         {
      type: "paragraph",
      text: "     b) Reclamaciones de coautores o herederos."
    },

             {
      type: "paragraph",
      text: "     c) Multas o sanciones administrativas." 
    },

                 {
      type: "paragraph",
      text: "     d) Costas judiciales y gastos de defensa." 
    },

                     {
      type: "paragraph",
      text: "8.3. HIT STAR no será responsable por disputas internas entre coautores."
    },


      // =====================================================
  // LIMITACIÓN DE RESPONSABILIDAD
  // =====================================================


      { type: "title", text: "IX. LIMITACIÓN DE RESPONSABILIDAD" },

    {
      type: "paragraph",
      text:   `9.1. HIT STAR no garantiza niveles mínimos de ingresos editoriales.`
    },

    {
      type: "paragraph",
      text: "9.1 Que es titular pleno y pacífico de los derechos objeto de licencia."
    },

    {
      type: "paragraph",
      text:  `9.2. HIT STAR no responderá por decisiones de terceros licenciatarios.`
    },

        {
      type: "paragraph",
      text: "9.3. En ningún caso responderá por daños indirectos o lucro cesante."
    },


    // ================= NATURALEZA MERCANTIL =================

    { type: "title", text: "X. NATURALEZA MERCANTIL" },

    {
      type: "paragraph",
      text: "10.1 El presente contrato tiene naturaleza estrictamente mercantil."
    },

    {
      type: "paragraph",
      text: "10.2 No existe relación laboral, societaria ni de representación."
    },

   // =====================================================
  // PROTECCIÓN DE DATOS
  // =====================================================

    { type: "title", text: "XI. PROTECCIÓN DE DATOS" },

    {
      type: "paragraph",
      text:  "11.1 El Las PARTES cumplirán la normativa española y europea de protección de datos."
    },

   // =====================================================
  // INTEGRIDAD CONTRACTUAL
  // =====================================================

    { type: "title", text: "XII. INTEGRIDAD CONTRACTUAL" },

    {
      type: "paragraph",
      text:  "12.1 El presente contrato constituye el acuerdo íntegro entre las PARTES y sustituye cualquier acuerdo previo."
    },

        {
      type: "paragraph",
      text:  "12.2 Toda modificación deberá realizarse por escrito."
    },


        // =====================================================
  // LEGISLACIÓN Y JURISDICCIÓN
  // =====================================================

      { type: "title", text: "XIII. LEGISLACIÓN Y JURISDICCIÓN" },

    {
      type: "paragraph",
      text:  "13.1 El contrato se regirá por la legislación española."
    },

        {
      type: "paragraph",
      text: "13.2 Las PARTES se someten a los Juzgados y Tribunales de Madrid."
    },



  ];

  // =====================================================
// ANEXO II – REPARTO EDITORIAL
// =====================================================

release.tracks.forEach((track: any) => {
  const splits = track.publishingCredits?.filter(
    (s: any) => Number(s.share) > 0
  ) || [];

  if (!splits.length) return;

  blocks.push({
    type: "paragraph",
    text: `Obra: ${track.title}`,
    bold: true,
  });

  splits.forEach((split: any) => {
    const share = Number(split.share || 0);
    const effective = (share * 0.9).toFixed(2);

    const name = `${split.firstName ?? ""} ${split.lastName ?? ""}`.trim();

    const PUBLISHING_ROLE_LABELS: Record<string, string> = {
  AUTOR: "Autor",
  AUTOR_MUSICA: "Autor de música",
  AUTOR_LETRA: "Autor de letra",
  AUTOR_MUSICA_LETRA: "Autor de música y letra",
  COAUTOR: "Coautor",
  COMPOSITOR: "Compositor",
};

    blocks.push({
      type: "paragraph",
      text: `${name} (${PUBLISHING_ROLE_LABELS[split.role] ?? split.role}): ${share}% (percibirá ${effective}%)`,
    });
  });

  blocks.push({
    type: "paragraph",
    text: "HIT STAR (Editor): 10%",
  });

  blocks.push({ type: "paragraph", text: " " });
});
return blocks;

}