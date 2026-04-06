export function getDistributionContractText({
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
    { type: "center", text: "CONTRATO DE LICENCIA DE DISTRIBUCIÓN DE FONOGRAMAS" },

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

    { type: "title", text: "I. EXPONEN" },

    {
      type: "paragraph",
      text: "1.1 EL INTÉRPRETE declara ser titular exclusivo y pleno de los derechos de propiedad intelectual y derechos afines sobre los fonogramas detallados en el Anexo I (en adelante, los 'Fonogramas')."
    },

    {
      type: "paragraph",
      text: "1.2 EL INTÉRPRETE manifiesta que los Fonogramas se encuentran libres de cargas, gravámenes, embargos o compromisos contractuales que limiten su explotación."
    },

    {
      type: "paragraph",
      text: "1.3 HIT STAR S.L. es una sociedad española dedicada a la distribución y explotación comercial de fonogramas en plataformas digitales."
    },

    {
      type: "paragraph",
      text: "1.4 Que ambas PARTES desean regular mediante el presente contrato las condiciones bajo las cuales HIT STAR explotará los Fonogramas."
    },

    // ================= OBJETO =================

    { type: "title", text: "II. OBJETO" },

    {
      type: "paragraph",
      text: "2.1 EL INTÉRPRETE concede a HIT STAR una licencia exclusiva para la reproducción, distribución, comunicación pública y puesta a disposición interactiva de los Fonogramas."
    },

    {
      type: "paragraph",
      text: "2.2 La licencia comprende los derechos de reproducción, distribución, comunicación pública y puesta a disposición interactiva de los Fonogramas."
    },

    {
      type: "paragraph",
      text: "2.3 La titularidad de los derechos permanecerá en todo momento en el patrimonio del INTÉRPRETE."
    },

    {
      type: "paragraph",
      text: "2.4 HIT STAR podrá adaptar los Fonogramas a los formatos técnicos exigidos por las plataformas o intermediarios."
    },


    // ================= OBJETO =================

    { type: "title", text: "III. ALCANCE" },

    {
      type: "paragraph",
      text: "3.1 HIT STAR podrá explotar los Fonogramas en plataformas digitales actualmente existentes o que puedan crearse en el futuro."
    },

    {
      type: "paragraph",
      text: "3.2 HIT STAR podrá sublicenciar derechos técnicos necesarios para su correcta distribución."
    },

    {
      type: "paragraph",
      text: "3.3 HIT STAR podrá utilizar el nombre artístico, imagen y material promocional del INTÉRPRETE exclusivamente en relación con la promoción de los Fonogramas."
    },

    {
      type: "paragraph",
      text: "3.4 HIT STAR no garantiza la aceptación, posicionamiento, visibilidad ni resultados comerciales en ninguna plataforma."
    },


    // ================= TERRITORIO =================

    { type: "title", text: "IV. TERRITORIO" },

    {
      type: "paragraph",
      text: `4.1 La explotación se realizará en: ${territory}.`
    },

    {
      type: "paragraph",
      text: "4.2 HIT STAR no será responsable de accesos desde territorios no autorizados."
    },

    // ================= DURACIÓN =================

    { type: "title", text: "V. DURACIÓN" },

    {
      type: "paragraph",
      text: "5.1 Duración de dos (2) años desde la firma."
    },

    {
      type: "paragraph",
      text: "5.2 Transcurrido el plazo inicial de un (2) años, el contrato se renovará automáticamente por períodos sucesivos de un (2) años, salvo que cualquiera de las partes notifique fehacientemente a la otra su voluntad de no renovarlo con una antelación mínima de tres (3) meses a la fecha de finalización del período en curso. En caso de que las partes suscriban un nuevo contrato, el presente acuerdo cesará automáticamente en su vigencia, sin que resulte aplicable la renovación automática prevista en esta cláusula."
    },

    {
      type: "paragraph",
      text: "5.3 HIT STAR no será responsable por retrasos en la retirada atribuibles a terceros."
    },

    // ================= CONTRAPRESTACIÓN =================

    { type: "title", text: "VI. CONTRAPRESTACIÓN" },

    {
      type: "paragraph",
      text: "6.1 HIT STAR percibirá el diez por ciento (10%) de los ingresos netos."
    },

    {
      type: "paragraph",
      text: "Se entenderá por ingresos netos las cantidades efectivamente percibidas por HIT STAR procedentes de las plataformas digitales, una vez deducidas:"
    },

    {
      type: "paragraph",
      text: "a) Comisiones de plataformas digitales."
    },

    {
      type: "paragraph",
      text: "b) Comisiones de agregadores o intermediarios técnicos."
    },

        {
      type: "paragraph",
      text: "c) Impuestos indirectos aplicables."
    },

    {
      type: "paragraph",
      text: "6.2 El noventa por ciento (90%) restante corresponderá al INTÉRPRETE."
    },


    // ================= LIQUIDACION Y PAGO =================

    { type: "title", text: "VII. LIQUIDACIÓN Y PAGO" },

    {
      type: "paragraph",
      text: "7.1 Las liquidaciones serán SEMESTRALES."
    },

    {
      type: "paragraph",
      text: "7.2 El pago se efectuará mediante transferencia bancaria dentro de los treinta (30) días siguientes a la liquidación."
    },

    // =====================================================
    // ENTREGA Y RESPONSABILIDAD
    // =====================================================


    { type: "title", text: "VIII. ENTREGA Y RESPONSABILIDAD" },

    {
      type: "paragraph",
      text: "8.1 El INTÉRPRETE entregará los Fonogramas en el formato técnico requerido por HIT STAR, incluyendo másteres finales, metadatos completos y códigos ISRC."
    },

    {
      type: "paragraph",
      text: "8.2 El INTÉRPRETE garantiza la veracidad y exactitud de toda la información facilitada."
    },

    {
      type: "paragraph",
      text: "8.3 HIT STAR podrá rechazar o suspender la distribución cuando la documentación sea incompleta o incorrecta."
    },


    // =====================================================
    // GARANTÍAS DEL INTÉRPRETE
    // =====================================================


    { type: "title", text: "IX. GARANTÍAS DEL INTÉRPRETE" },

    {
      type: "paragraph",
      text: "El INTÉRPRETE manifiesta y garantiza:"
    },

    {
      type: "paragraph",
      text: "9.1 Que es titular pleno y pacífico de los derechos objeto de licencia."
    },

    {
      type: "paragraph",
      text: "9.2 Que los Fonogramas no infringen derechos de terceros."
    },

    {
      type: "paragraph",
      text: "9.3 Que ha obtenido todas las autorizaciones necesarias de músicos, productores, intérpretes y colaboradores."
    },

    {
      type: "paragraph",
      text: "9.4 Que no existen contratos previos incompatibles."
    },

    {
      type: "paragraph",
      text: "9.5 Que los Fonogramas no contienen muestras no autorizadas ni contenidos ilícitos."
    },

    // ================= INDEMNIDAD =================

    { type: "title", text: "X. INDEMNIDAD" },

    {
      type: "paragraph",
      text: "10.1 El INTÉRPRETE asumirá íntegramente la responsabilidad frente a cualquier reclamación de terceros relacionada con la explotación de los Fonogramas."
    },

    {
      type: "paragraph",
      text: "10.2 El INTÉRPRETE mantendrá indemne a HIT STAR frente a:"
    },

    {
      type: "paragraph",
      text: "     a) Reclamaciones por infracción de derechos de propiedad intelectual o industrial."
    },

    {
      type: "paragraph",
      text: "     b) Reclamaciones de coautores o colaboradores."
    },

    {
      type: "paragraph",
      text: "     c) Reclamaciones de entidades de gestión."
    },

    {
      type: "paragraph",
      text: "     d) Multas, sanciones, costas judiciales y gastos de defensa."
    },

    {
      type: "paragraph",
      text: "10.3 HIT STAR no será responsable en ningún caso por reclamaciones derivadas de la titularidad o contenido de los Fonogramas."
    },

    // =====================================================
    // SUSPENSIÓN O RETIRADA
    // =====================================================

    { type: "title", text: "XI. SUSPENSIÓN O RETIRADA" },

    {
      type: "paragraph",
      text: "11.1 HIT STAR podrá suspender o retirar los Fonogramas cuando exista reclamación fundada o riesgo jurídico."
    },

    {
      type: "paragraph",
      text: "11.2 Dicha suspensión no generará derecho a indemnización."
    },

    // =====================================================
    // LIMITACIÓN DE RESPONSABILIDAD
    // =====================================================

    { type: "title", text: "XII. LIMITACIÓN DE RESPONSABILIDAD" },

    {
      type: "paragraph",
      text: "12.1 HIT STAR no será responsable por decisiones adoptadas por plataformas, cambios en algoritmos, políticas comerciales o suspensiones de cuentas."
    },

    {
      type: "paragraph",
      text: "12.2 HIT STAR no responderá por daños indirectos, lucro cesante o pérdida de oportunidades comerciales."
    },


    // =====================================================
    // NATURALEZA MERCANTIL
    // =====================================================

    { type: "title", text: "XIII. NATURALEZA MERCANTIL" },

    {
      type: "paragraph",
      text: "13.1 El presente contrato tiene naturaleza estrictamente mercantil."
    },

    {
      type: "paragraph",
      text: "13.2 No existe relación laboral, societaria ni de representación."
    },


    // =====================================================
    // 14. PROTECCIÓN DE DATOS
    // =====================================================

    { type: "title", text: "XIV. PROTECCIÓN DE DATOS" },

    {
      type: "paragraph",
      text: "14.1 El Las PARTES cumplirán la normativa española y europea de protección de datos."
    },

    // =====================================================
    // INTEGRIDAD CONTRACTUAL
    // =====================================================


    { type: "title", text: "XV. INTEGRIDAD CONTRACTUAL" },

    {
      type: "paragraph",
      text: "15.1 El presente contrato constituye el acuerdo íntegro entre las PARTES y sustituye cualquier acuerdo previo."
    },

    {
      type: "paragraph",
      text: "15.2 Toda modificación deberá realizarse por escrito."
    },


    // ================= JURISDICCIÓN =================

    { type: "title", text: "XVI. LEGISLACIÓN Y JURISDICCIÓN" },

    {
      type: "paragraph",
      text: "El contrato se regirá por la legislación española."
    },

    {
      type: "paragraph",
      text: "Las PARTES se someten a los Juzgados y Tribunales de Madrid."
    },

    { type: "title", text: "XVII. EXPLOTACIÓN EN REDES SOCIALES Y SERVICIOS UGC" },

{
  type: "paragraph",
  text: "La licencia concedida en el presente contrato incluye la explotación de los Fonogramas en servicios de contenido generado por usuarios (UGC) y redes sociales."
},

{
  type: "paragraph",
  text: "Entre dichos servicios se incluyen, entre otros, TikTok, Instagram, Facebook, YouTube (incluyendo YouTube Shorts), Snapchat, Triller y cualquier otra plataforma de naturaleza similar existente en la actualidad o que pueda desarrollarse en el futuro."
},

{
  type: "paragraph",
  text: "HIT STAR podrá autorizar la incorporación de los Fonogramas en bibliotecas musicales, herramientas de creación audiovisual y sistemas equivalentes ofrecidos por dichas plataformas."
}


    // 👇 ELIMINA ESTE CIERRE
  ];

  // 👇 Y CAMBIA POR ESTO:
  // ANEXO MASTER

  blocks.push({
    type: "title",
    text: "ANEXO I – CATÁLOGO Y REPARTO MASTER",
  });

  release.tracks.forEach((track: any) => {
    blocks.push({
      type: "paragraph",
      text: `Fonograma: ${track.title}`,
      bold: true,
    });

    const splits = track.masterParties || [];

    const MASTER_ROLE_LABELS: Record<string, string> = {
      ARTIST: "Artista principal",
      PRODUCER: "Productor",
      LABEL: "Sello discográfico",
      INVESTOR: "Inversor",
      RIGHTSHOLDER: "Titular del máster",
    };

    splits.forEach((split: any) => {
      const share = Number(split.ownershipShare || 0);
      const effective = (share * 0.9).toFixed(2);

      blocks.push({
        type: "paragraph",
        text: `${split.legalName} (${MASTER_ROLE_LABELS[split.role] ?? split.role}): ${share}% (percibirá ${effective}%)`,
      });
    });

    blocks.push({
      type: "paragraph",
      text: "HIT STAR S.L.: 10%",
    });

    blocks.push({ type: "paragraph", text: " " });
  });

  return blocks;
}