import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { TERRITORY_NAMES } from "@/lib/territories";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const releaseId = searchParams.get("releaseId");

  if (!releaseId)
    return new Response("Missing releaseId", { status: 400 });

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: {
      artist: { include: { user: true } },
      tracks: { include: { splits: true } },
    },
  });

  if (!release)
    return new Response("Release not found", { status: 404 });

  const artistName =
    release.artist?.user?.name ??
    release.artist?.user?.email ??
    "EL INTÉRPRETE";

  const today = new Date().toLocaleDateString("es-ES");

  const territory = release.distributionWorldwide
    ? "Territorio mundial"
    : release.distributionTerritories
    ? release.distributionTerritories
        .map((id: string) => TERRITORY_NAMES[id] || id)
        .join(", ")
    : "Territorio seleccionado";

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 70;
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let pages = [page];
  let y = pageHeight - margin;

  function newPage() {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    pages.push(page);
    y = pageHeight - margin;
  }

  function ensureSpace(height = 20) {
    if (y - height < margin) newPage();
  }

  function drawParagraph(text: string, size = 11, bold = false) {
    const words = text.split(" ");
    let line = "";

    for (let word of words) {
      const testLine = line + word + " ";
      const width = (bold ? fontBold : font).widthOfTextAtSize(
        testLine,
        size
      );

      if (width > contentWidth) {
        ensureSpace(18);

        page.drawText(line.trim(), {
          x: margin,
          y,
          size,
          font: bold ? fontBold : font,
        });

        y -= 16;
        line = word + " ";
      } else {
        line = testLine;
      }
    }

    if (line) {
      ensureSpace(18);
      page.drawText(line.trim(), {
        x: margin,
        y,
        size,
        font: bold ? fontBold : font,
      });
      y -= 20;
    }
  }

  function drawTitle(text: string) {
    ensureSpace(30);
    page.drawText(text, {
      x: margin,
      y,
      size: 13,
      font: fontBold,
    });
    y -= 26;
  }

  function drawCentered(text: string, size = 16) {
    ensureSpace(30);
    const width = fontBold.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (pageWidth - width) / 2,
      y,
      size,
      font: fontBold,
    });
    y -= 30;
  }

  // =====================================================
  // PORTADA
  // =====================================================

  drawCentered("HIT STAR S.L.");
  drawCentered("CONTRATO DE LICENCIA DE DISTRIBUCIÓN DE FONOGRAMAS", 14);
  y -= 20;

  drawParagraph(
    `En Madrid, a ${today}, las partes abajo firmantes celebran el presente contrato entre HIT STAR S.L. y ${artistName}.`
  );

  // =====================================================
  // EXPOSICIÓN
  // =====================================================

  drawTitle("PARTES");

  drawParagraph(
    "De una parte, HIT STAR S.L., sociedad de responsabilidad limitada constituida conforme a la legislación española, con CIF __________, con domicilio social en __________, inscrita en el Registro Mercantil correspondiente, representada en este acto por su representante legal con facultades suficientes (en adelante, “HIT STAR”)."
  );

  drawParagraph(
    "Y de otra parte, D./Dª __________________________, mayor de edad, con DNI/NIE __________, con domicilio en __________________________, actuando en su propio nombre y derecho (en adelante, el “INTÉRPRETE”). Ambas partes, en adelante denominadas conjuntamente las “PARTES”, se reconocen capacidad legal suficiente para contratar y obligarse y, a tal efecto"
  );




  // =====================================================
  // EXPOSICIÓN
  // =====================================================

  drawTitle("I. EXPONEN");

  drawParagraph(
    "1.1 EL INTÉRPRETE declara ser titular exclusivo y pleno de los derechos de propiedad intelectual y derechos afines sobre los fonogramas detallados en el Anexo I (en adelante, los 'Fonogramas')."
  );

  drawParagraph(
    "1.2 EL INTÉRPRETE manifiesta que los Fonogramas se encuentran libres de cargas, gravámenes, embargos o compromisos contractuales que limiten su explotación."
  );

  drawParagraph(
    "1.3 HIT STAR S.L. es una sociedad española dedicada a la distribución y explotación comercial de fonogramas en plataformas digitales."
  );

    drawParagraph(
    "1.4 Que ambas PARTES desean regular mediante el presente contrato las condiciones bajo las cuales HIT STAR explotará los Fonogramas."
  );

  // =====================================================
  // OBJETO
  // =====================================================

  drawTitle("II. OBJETO");

  drawParagraph(
    "2.1 EL INTÉRPRETE concede a HIT STAR una licencia exclusiva para la reproducción, distribución, comunicación pública y puesta a disposición interactiva de los Fonogramas."
  );

  drawParagraph(
    "2.2 La licencia comprende los derechos de reproducción, distribución, comunicación pública y puesta a disposición interactiva de los Fonogramas."
  );

  drawParagraph(
    "2.3 La titularidad de los derechos permanecerá en todo momento en el patrimonio del INTÉRPRETE."
  );

    drawParagraph(
    "2.4 HIT STAR podrá adaptar los Fonogramas a los formatos técnicos exigidos por las plataformas o intermediarios."
  );

  // =====================================================
  // ALCANCE
  // =====================================================

  drawTitle("III. ALCANCE");

  drawParagraph(`3.1 HIT STAR podrá explotar los Fonogramas en plataformas digitales actualmente existentes o que puedan crearse en el futuro.`);

  drawParagraph(
    "3.2 HIT STAR podrá sublicenciar derechos técnicos necesarios para su correcta distribución."
  );

    drawParagraph(
    "3.3 HIT STAR podrá utilizar el nombre artístico, imagen y material promocional del INTÉRPRETE exclusivamente en relación con la promoción de los Fonogramas."
  );

      drawParagraph(
    "3.4 HIT STAR no garantiza la aceptación, posicionamiento, visibilidad ni resultados comerciales en ninguna plataforma."
  );


  // =====================================================
  // TERRITORIO
  // =====================================================

  drawTitle("IV. TERRITORIO");

  drawParagraph(`4.1 La explotación se realizará en: ${territory}.`);

  drawParagraph(
    "4.2 HIT STAR no será responsable de accesos desde territorios no autorizados derivados de tecnologías externas o VPNs."
  );

  // =====================================================
  // DURACIÓN
  // =====================================================

  drawTitle("V. DURACIÓN");

  drawParagraph(
    "5.1 El presente contrato tendrá una duración de dos (2) años desde su firma."
  );

  drawParagraph(
    "5.2 Transcurrido el plazo inicial de un (2) años, el contrato se renovará automáticamente por períodos sucesivos de un (2) años, salvo que cualquiera de las partes notifique fehacientemente a la otra su voluntad de no renovarlo con una antelación mínima de tres (3) meses a la fecha de finalización del período en curso. En caso de que las partes suscriban un nuevo contrato, el presente acuerdo cesará automáticamente en su vigencia, sin que resulte aplicable la renovación automática prevista en esta cláusula."
  );

  drawParagraph(
    "5.3 HIT STAR no será responsable por retrasos en la retirada atribuibles a terceros."
  );

  // =====================================================
  // CONTRAPRESTACIÓN
  // =====================================================

  drawTitle("VI. CONTRAPRESTACIÓN");

  drawParagraph(
    "6.1 HIT STAR percibirá el diez por ciento (10%) de los ingresos netos."
  );

    drawParagraph(
    "6.2 El noventa por ciento (90%) restante corresponderá al INTÉRPRETE."
  );


  drawParagraph("6.3 Se entenderá por Ingresos Netos las cantidades efectivamente percibidas por HIT STAR, una vez deducidos:");
   drawParagraph("     a) Comisiones de plataformas o intermediarios.")
drawParagraph("     b) Impuestos indirectos aplicables.")
drawParagraph("     c) Costes bancarios directamente asociados." )

  // =====================================================
  // LIQUIDACION Y PAGO
  // =====================================================

  drawTitle("VII. LIQUIDACIÓN Y PAGO");

  drawParagraph(
    "7.1 Las liquidaciones serán SEMESTRALES."
  );

  drawParagraph(
    "7.2 El pago se efectuará mediante transferencia bancaria dentro de los treinta (30) días siguientes a la liquidación."
  );

  // =====================================================
  // ENTREGA Y RESPONSABILIDAD
  // =====================================================

  drawTitle("VIII. ENTREGA Y RESPONSABILIDAD");

  drawParagraph(
    "8.1 El INTÉRPRETE entregará los Fonogramas en el formato técnico requerido por HIT STAR, incluyendo másteres finales, metadatos completos y códigos ISRC."
  );

  drawParagraph(
    "8.2 El INTÉRPRETE garantiza la veracidad y exactitud de toda la información facilitada."
  );

   drawParagraph(
    "8.3 HIT STAR podrá rechazar o suspender la distribución cuando la documentación sea incompleta o incorrecta."
  );

  // =====================================================
  // GARANTÍAS DEL INTÉRPRETE
  // =====================================================


  drawTitle("IX. GARANTÍAS DEL INTÉRPRETE");

  drawParagraph(
    "El INTÉRPRETE manifiesta y garantiza:"
  );

  drawParagraph(
    "9.1 Que es titular pleno y pacífico de los derechos objeto de licencia."
  );

   drawParagraph(
    "9.2 Que los Fonogramas no infringen derechos de terceros."
  );

     drawParagraph(
    "9.3 Que ha obtenido todas las autorizaciones necesarias de músicos, productores, intérpretes y colaboradores."
  );

     drawParagraph(
    "9.4 Que no existen contratos previos incompatibles."
  );

       drawParagraph(
    "9.5 Que los Fonogramas no contienen muestras no autorizadas ni contenidos ilícitos."
  );

  // =====================================================
  // INDEMNIDAD
  // =====================================================

  drawTitle("X. INDEMNIDAD");

  drawParagraph(
    "10.1 El INTÉRPRETE asumirá íntegramente la responsabilidad frente a cualquier reclamación de terceros relacionada con la explotación de los Fonogramas."
  );
    drawParagraph(
    "10.2 El INTÉRPRETE mantendrá indemne a HIT STAR frente a:"
  );
   drawParagraph("     a) Reclamaciones por infracción de derechos de propiedad intelectual o industrial.")
drawParagraph("     b) Reclamaciones de coautores o colaboradores.")
drawParagraph("     c) Reclamaciones de entidades de gestión.")
drawParagraph("     d) Multas, sanciones, costas judiciales y gastos de defensa.")

    drawParagraph(
    "10.3 HIT STAR no será responsable en ningún caso por reclamaciones derivadas de la titularidad o contenido de los Fonogramas."
  );

   // =====================================================
  // SUSPENSIÓN O RETIRADA
  // =====================================================

  drawTitle("XI. SUSPENSIÓN O RETIRADA");

  drawParagraph(
    "11.1 HIT STAR podrá suspender o retirar los Fonogramas cuando exista reclamación fundada o riesgo jurídico."
  );
    drawParagraph(
    "11.2 Dicha suspensión no generará derecho a indemnización."
  );

   // =====================================================
  // LIMITACIÓN DE RESPONSABILIDAD
  // =====================================================

  drawTitle("XII. LIMITACIÓN DE RESPONSABILIDAD");

  drawParagraph(
    "12.1 HIT STAR no será responsable por decisiones adoptadas por plataformas, cambios en algoritmos, políticas comerciales o suspensiones de cuentas."
  );
    drawParagraph(
    "12.2 HIT STAR no responderá por daños indirectos, lucro cesante o pérdida de oportunidades comerciales."
  );

    // =====================================================
  // NATURALEZA MERCANTIL
  // =====================================================

  drawTitle("XIII. NATURALEZA MERCANTIL");

  drawParagraph(
    "13.1 El presente contrato tiene naturaleza estrictamente mercantil."
  );
    drawParagraph(
    "13.2 No existe relación laboral, societaria ni de representación."
  );

      // =====================================================
  // 14. PROTECCIÓN DE DATOS
  // =====================================================

  drawTitle("XIV. 14. PROTECCIÓN DE DATOS");

  drawParagraph(
    "14.1 El Las PARTES cumplirán la normativa española y europea de protección de datos."
  );
    
     // =====================================================
  // INTEGRIDAD CONTRACTUAL
  // =====================================================

  drawTitle("XV. INTEGRIDAD CONTRACTUAL");

  drawParagraph(
    "15.1 El presente contrato constituye el acuerdo íntegro entre las PARTES y sustituye cualquier acuerdo previo."
  );
    drawParagraph(
    "15.2 Toda modificación deberá realizarse por escrito."
  );

     // =====================================================
  // LEGISLACIÓN Y JURISDICCIÓN
  // =====================================================

  drawTitle("XVI. LEGISLACIÓN Y JURISDICCIÓN");

  drawParagraph(
    "16.1 El contrato se regirá por la legislación española."
  );
    drawParagraph(
    "16.2 Las PARTES se someten a los Juzgados y Tribunales de Madrid."
  );


  // =====================================================
  // ANEXO MASTER
  // =====================================================

  drawTitle("ANEXO I – CATÁLOGO Y REPARTO MASTER");

  for (const track of release.tracks) {
    drawParagraph(`Fonograma: ${track.title}`, 11, true);

    const splits = track.splits.filter(s => s.type === "MASTER");

    for (const split of splits) {
      const effective = (split.percentage * 0.9).toFixed(2);
      drawParagraph(
        `${split.name}: ${split.percentage}% (percibirá ${effective}%)`
      );
    }

    drawParagraph("HIT STAR S.L.: 10%");
    y -= 10;
  }

  // =====================================================
  // EDITORIAL NUEVA PÁGINA
  // =====================================================

  newPage();

  drawCentered("CONTRATO DE GESTIÓN EDITORIAL", 14);

 drawParagraph(
    `En Madrid, a ${today}, las partes abajo firmantes celebran el presente contrato entre HIT STAR S.L. y ${artistName}.`
  );

  // =====================================================
  // EXPOSICIÓN
  // =====================================================

  drawTitle("PARTES");

  drawParagraph(
    "De una parte, HIT STAR S.L., sociedad de responsabilidad limitada constituida conforme a la legislación española, con CIF __________, con domicilio social en __________, inscrita en el Registro Mercantil correspondiente, representada en este acto por su representante legal con facultades suficientes (en adelante, “HIT STAR”)."
  );

  drawParagraph(
    "Y de otra parte, D./Dª __________________________, mayor de edad, con DNI/NIE __________, con domicilio en __________________________, actuando en su propio nombre y derecho (en adelante, el “INTÉRPRETE”). Ambas partes, en adelante denominadas conjuntamente las “PARTES”, se reconocen capacidad legal suficiente para contratar y obligarse y, a tal efecto"
  );


  // =====================================================
  // OBJETO
  // =====================================================

  drawTitle("I. OBJETO");

  drawParagraph(
    "1.1. El AUTOR otorga a HIT STAR mandato de gestión editorial para la administración, gestión, recaudación y explotación económica de las OBRAS."
  );

  drawParagraph(
    "1.2. El presente contrato constituye un contrato de gestión y administración, no implicando en ningún caso cesión de la titularidad de los derechos de propiedad intelectual."
  );

  drawParagraph(
    "1.3. La titularidad de las OBRAS permanecerá en todo momento en el patrimonio del AUTOR."
  );


    // =====================================================
  // ALCANCE DE LA GESTÓN
  // =====================================================

  drawTitle("II. ALCANCE DE LA GESTÓN");

  drawParagraph(
    "2.1. El mandato conferido incluye:"
  );

     drawParagraph("     a) Gestión ante entidades de gestión colectiva.")
drawParagraph("     b) Recaudación de derechos de reproducción y comunicación pública.")
drawParagraph("     c) Gestión de sincronizaciones audiovisuales.")
drawParagraph("     d) Concesión de sublicencias editoriales cuando resulte necesario.")
drawParagraph("     e) Recaudación de derechos derivados de explotación digital." )

  drawParagraph(
    "2.2. HIT STAR podrá actuar directamente o a través de subeditores o agentes en otros territorios."
  );

  drawParagraph(
    "2.3. HIT STAR no garantiza la colocación de sincronizaciones ni resultados comerciales concretos."
  );

      // =====================================================
  // TERRITORIO
  // =====================================================

  drawTitle("III. TERRITORIO");

  drawParagraph(`3.1 La explotación se realizará en: ${territory}.`);

  drawParagraph(`3.2 La gestión podrá realizarse directa o indirectamente en dicho territorio.`);

      // =====================================================
  // DURACIÓN
  // =====================================================

  drawTitle("IV. DURACIÓN");

  drawParagraph(`4.1. El presente contrato tendrá una duración de dos (2) años desde su firma.`);

  drawParagraph(`4.2 Transcurrido el plazo inicial de un (2) años, el contrato se renovará automáticamente por períodos sucesivos de un (2) años, salvo que cualquiera de las partes notifique fehacientemente a la otra su voluntad de no renovarlo con una antelación mínima de tres (3) meses a la fecha de finalización del período en curso. En caso de que las partes suscriban un nuevo contrato, el presente acuerdo cesará automáticamente en su vigencia, sin que resulte aplicable la renovación automática prevista en esta cláusula.`);

      // =====================================================
  // CONTRAPRESTACIÓN
  // =====================================================

  drawTitle("V. CONTRAPRESTACIÓN");

  drawParagraph(`5.1. Como remuneración por los servicios prestados, HIT STAR percibirá el diez por ciento (10%) de los ingresos netos efectivamente percibidos derivados de la explotación editorial de las OBRAS.`);

  drawParagraph(`5.2. Se entenderá por ingresos netos las cantidades efectivamente cobradas, una vez deducidos:`);


     drawParagraph("     a) Comisiones de subeditores o agentes.")
drawParagraph("     b) Comisiones de entidades de gestión.")
drawParagraph("     c) Impuestos indirectos aplicables." )

  drawParagraph(`El noventa por ciento (90%) restante corresponderá al AUTOR.`);

     drawParagraph("5.4. No se considerarán ingresos netos aquellas cantidades devengadas pero no cobradas.")

  // =====================================================
  // LIQUIDACIÓN Y PAGO
  // =====================================================

  drawTitle("VI. LIQUIDACIÓN Y PAGO");

  drawParagraph(`6.1. Las liquidaciones serán SEMESTRALES.`);

  drawParagraph(`6.2. El pago se realizará dentro de los treinta (30) días siguientes a cada liquidación.`);

  drawParagraph("6.3. El AUTOR podrá auditar las cuentas una vez por año, previa notificación con treinta (30) días de antelación.")

  // =====================================================
  // DECLARACIONES Y GARANTÍAS
  // =====================================================

  drawTitle("VII. DECLARACIONES Y GARANTÍAS");

  drawParagraph(`El AUTOR declara y garantiza:`);

  drawParagraph(`7.1. Que es titular legítimo de los derechos de autor sobre las OBRAS.`);

  drawParagraph("7.2. Que no existen cesiones, gravámenes ni compromisos que impidan la presente gestión.")

    drawParagraph("7.3. Que las OBRAS no infringen derechos de terceros.")

    drawParagraph("7.4. Que ha obtenido las autorizaciones necesarias de coautores, en su caso.")

  // =====================================================
  // INDEMNIDAD
  // =====================================================

  drawTitle("VIII. INDEMNIDAD");

  drawParagraph(`8.1. El AUTOR asumirá íntegramente la responsabilidad frente a cualquier reclamación derivada de la titularidad o contenido de las OBRAS.`);

  drawParagraph(`8.2. El AUTOR mantendrá indemne a HIT STAR frente a:`);

      drawParagraph("     a) Reclamaciones por infracción de derechos.")
drawParagraph("     b) Reclamaciones de coautores o herederos.")
drawParagraph("     c) Multas o sanciones administrativas." )
drawParagraph("     d) Costas judiciales y gastos de defensa." )

    drawParagraph("8.3. HIT STAR no será responsable por disputas internas entre coautores.")


      // =====================================================
  // LIMITACIÓN DE RESPONSABILIDAD
  // =====================================================

  drawTitle("IX. LIMITACIÓN DE RESPONSABILIDAD");

  drawParagraph(`9.1. HIT STAR no garantiza niveles mínimos de ingresos editoriales.`);

  drawParagraph(`9.2. HIT STAR no responderá por decisiones de terceros licenciatarios.`);

    drawParagraph("9.3. En ningún caso responderá por daños indirectos o lucro cesante.")


    // =====================================================
  // NATURALEZA MERCANTIL
  // =====================================================

  drawTitle("X. NATURALEZA MERCANTIL");

  drawParagraph(
    "10.1 El presente contrato tiene naturaleza estrictamente mercantil."
  );
    drawParagraph(
    "10.2 No existe relación laboral, societaria ni de representación."
  );

      // =====================================================
  // PROTECCIÓN DE DATOS
  // =====================================================

  drawTitle("XI. PROTECCIÓN DE DATOS");

  drawParagraph(
    "11.1 El Las PARTES cumplirán la normativa española y europea de protección de datos."
  );
    
     // =====================================================
  // INTEGRIDAD CONTRACTUAL
  // =====================================================

  drawTitle("XII. INTEGRIDAD CONTRACTUAL");

  drawParagraph(
    "12.1 El presente contrato constituye el acuerdo íntegro entre las PARTES y sustituye cualquier acuerdo previo."
  );
    drawParagraph(
    "12.2 Toda modificación deberá realizarse por escrito."
  );

     // =====================================================
  // LEGISLACIÓN Y JURISDICCIÓN
  // =====================================================

  drawTitle("XIII. LEGISLACIÓN Y JURISDICCIÓN");

  drawParagraph(
    "13.1 El contrato se regirá por la legislación española."
  );
    drawParagraph(
    "13.2 Las PARTES se someten a los Juzgados y Tribunales de Madrid.");



  drawTitle("ANEXO II – REPARTO EDITORIAL");

  for (const track of release.tracks) {
    const splits = track.splits.filter(
      s => s.type === "PUBLISHING" && s.percentage > 0
    );

    if (!splits.length) continue;

    drawParagraph(`Obra: ${track.title}`, 11, true);

    for (const split of splits) {
      const effective = (split.percentage * 0.9).toFixed(2);
      drawParagraph(
        `${split.name}: ${split.percentage}% (percibirá ${effective}%)`
      );
    }

    drawParagraph("HIT STAR (Editor): 10%");
    y -= 10;
  }

  // =====================================================
  // FIRMAS
  // =====================================================

  y -= 30;

  drawParagraph(
    "En prueba de conformidad, ambas partes firman el presente contrato."
  );

  y -= 20;

  drawParagraph("HIT STAR S.L.", 11, true);
  drawParagraph("Pedro Miguel Trula");

  y -= 20;

  drawParagraph("EL INTÉRPRETE", 11, true);
  drawParagraph(artistName);

  // =====================================================
  // PAGINACIÓN
  // =====================================================

  const total = pages.length;

  pages.forEach((p, i) => {
    p.drawText(`Página ${i + 1} de ${total}`, {
      x: pageWidth - 140,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Precontrato-${release.title}.pdf"`,
    },
  });
}