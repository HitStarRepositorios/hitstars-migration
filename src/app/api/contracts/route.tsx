import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createHash } from "crypto";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { artist: true },
  });

  if (!user) return new NextResponse("User not found", { status: 404 });

  const contractNumber = `HS-${Date.now()}`;
  const today = new Date().toLocaleDateString("es-ES");

  // =====================================================
  // PDF SETUP PROFESIONAL
  // =====================================================

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
  drawCentered("CONTRATO DE LICENCIA DE DISTRIBUCIÓN", 14);
  y -= 10;

  drawParagraph(`CONTRATO Nº ${contractNumber}`);
  drawParagraph(`En Madrid, a ${today}.`);
  y -= 10;

  // =====================================================
  // PARTES
  // =====================================================

  drawTitle("I. PARTES");

  drawParagraph(
    "De una parte, HIT STAR S.L., sociedad de responsabilidad limitada constituida conforme a la legislación española, representada por su administrador Pedro Miguel Trula, DNI 72171345J, en adelante 'HIT STAR'."
  );

  drawParagraph(
    `Y de otra parte, ${user.name}, mayor de edad, quien declara actuar en su propio nombre y derecho, en adelante 'EL TITULAR'.`
  );

  // =====================================================
  // EXPOSICIÓN
  // =====================================================

  drawTitle("II. MANIFIESTAN");

  drawParagraph(
    "Que EL TITULAR es propietario exclusivo y legítimo de todos los derechos de propiedad intelectual, fonográficos y de explotación sobre las grabaciones entregadas."
  );

  drawParagraph(
    "Que dichas grabaciones se encuentran libres de cargas, gravámenes o compromisos contractuales que impidan su explotación."
  );

  drawParagraph(
    "Que HIT STAR actúa como empresa distribuidora y prestadora de servicios de explotación comercial."
  );

  // =====================================================
  // OBJETO
  // =====================================================

  drawTitle("III. OBJETO");

  drawParagraph(
    "EL TITULAR concede a HIT STAR una licencia exclusiva para la reproducción, distribución, comunicación pública y puesta a disposición interactiva de las grabaciones en plataformas digitales."
  );

  drawParagraph(
    "La titularidad de las grabaciones permanecerá en todo momento al 100% en favor de EL TITULAR."
  );

  // =====================================================
  // DURACIÓN
  // =====================================================

  drawTitle("IV. DURACIÓN");

  drawParagraph(
    "El presente contrato tendrá una duración de dos (2) años desde su firma."
  );

  drawParagraph(
    "Se renovará automáticamente por períodos sucesivos de dos (2) años salvo notificación escrita con tres (3) meses de antelación."
  );

  // =====================================================
  // CONTRAPRESTACIÓN
  // =====================================================

  drawTitle("V. CONTRAPRESTACIÓN");

  drawParagraph(
    "HIT STAR percibirá el diez por ciento (10%) de los ingresos netos efectivamente percibidos."
  );

  drawParagraph(
    "El noventa por ciento (90%) restante será abonado a EL TITULAR."
  );

  drawParagraph(
    "Se entenderá por ingresos netos las cantidades efectivamente cobradas una vez deducidas comisiones de plataformas e impuestos."
  );

  // =====================================================
  // LIQUIDACIONES
  // =====================================================

  drawTitle("VI. LIQUIDACIONES");

  drawParagraph(
    "Las liquidaciones serán semestrales y el pago se realizará dentro de los treinta (30) días siguientes."
  );

  // =====================================================
  // INDEMNIDAD
  // =====================================================

  drawTitle("VII. INDEMNIDAD");

  drawParagraph(
    "EL TITULAR asumirá íntegramente la responsabilidad frente a cualquier reclamación de terceros derivada de la titularidad, contenido o explotación de las grabaciones."
  );

  drawParagraph(
    "HIT STAR no será responsable en ningún caso por reclamaciones de coautores, productores, entidades de gestión o terceros."
  );

  drawParagraph(
    "EL TITULAR mantendrá indemne a HIT STAR frente a multas, sanciones, gastos legales y costas judiciales."
  );

  // =====================================================
  // JURISDICCIÓN
  // =====================================================

  drawTitle("VIII. LEGISLACIÓN Y JURISDICCIÓN");

  drawParagraph(
    "El presente contrato se regirá por la legislación española."
  );

  drawParagraph(
    "Las partes se someten a los Juzgados y Tribunales de Madrid."
  );

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

  drawParagraph("EL TITULAR", 11, true);
  drawParagraph(user.name);

  // =====================================================
  // FOOTER
  // =====================================================

  const total = pages.length;

  pages.forEach((p, i) => {
    p.drawText(`Contrato ${contractNumber}`, {
      x: 50,
      y: 30,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    p.drawText(`Página ${i + 1} de ${total}`, {
      x: pageWidth - 140,
      y: 30,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  const pdfBytes = await pdfDoc.save();

  const hash = createHash("sha256")
    .update(pdfBytes)
    .digest("hex");

  await prisma.contract.create({
    data: {
      contractNumber,
      hash,
      user: { connect: { id: user.id } },
    },
  });

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Contrato_${contractNumber}.pdf`,
    },
  });
}