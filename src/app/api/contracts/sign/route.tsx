import { prisma } from "@/lib/prisma";
import { ReleaseStatus } from "@prisma/client";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { sendEmail } from "@/lib/email";
import { uploadToR2 } from "@/lib/r2";
import crypto from "crypto";
import { distributeRelease } from "@/lib/ddex/distributeRelease";

import { getDistributionContractText } from "@/lib/contracts/distributionContract";
import { getPublishingContractText } from "@/lib/contracts/publishingContract";

/* =====================================================
   GENERADOR PDF
===================================================== */

async function generateContractPDF({
  release,
  signedAt,
  ip,
  contractId,
}: {
  release: any;
  signedAt: Date;
  ip: string;
  contractId: string;
}) {
  const kyc = release.artist?.user?.kyc;

  const artistName =
    kyc?.firstName && kyc?.lastName
      ? `${kyc.firstName} ${kyc.lastName}`
      : release.artist?.user?.name ??
      release.artist?.user?.email ??
      "EL INTÉRPRETE";

  const legalName = artistName;

  const dni =
    kyc?.documentNumber ??
    "__________";

  const address =
    [
      kyc?.addressLine1,
      kyc?.city,
      kyc?.postalCode,
      kyc?.country,
    ]
      .filter(Boolean)
      .join(", ") || "__________________________";

  const TERRITORY_LABELS: Record<string, string> = {
    EUROPE: "Unión Europea",
    LATAM: "Latinoamérica",
    NORTH_AMERICA: "Norteamérica",
    ASIA: "Asia",
    AFRICA: "África",
    OCEANIA: "Oceanía",
    RUSSIA: "Rusia y territorios asociados",
  };

  let territory = "Mundial";

  if (!release.distributionWorldwide) {
    const regions = release.distributionTerritories as string[] | null;

    if (regions && regions.length > 0) {
      territory = regions
        .map((r) => TERRITORY_LABELS[r] ?? r)
        .join(", ");
    }
  }

  const today = signedAt.toLocaleDateString("es-ES");

  const hasPublishing = release.tracks.some((track: any) =>
    track.publishingCredits?.some(
      (credit: any) => Number(credit.share) > 0
    )
  );

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

  function sanitizeText(text: string) {
    return text
      .normalize("NFC")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function drawParagraph(text: string, size = 11, bold = false) {
    const words = text.split(" ");
    let line = "";

    for (let word of words) {
      const testLine = sanitizeText(line + word + " ");
      const width = (bold ? fontBold : font).widthOfTextAtSize(
        testLine,
        size
      );

      if (width > contentWidth) {
        ensureSpace(18);

        page.drawText(sanitizeText(line.trim()), {
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
      page.drawText(sanitizeText(text), {
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
    const clean = sanitizeText(text);
    const width = fontBold.widthOfTextAtSize(clean, size);
    page.drawText(clean, {
      x: (pageWidth - width) / 2,
      y,
      size,
      font: fontBold,
    });
    y -= 30;
  }

  /* =====================================================
     CONSTRUIR BLOQUES DINÁMICAMENTE
  ===================================================== */

  const blocks: any[] = [];

  blocks.push(
    ...getDistributionContractText({
      release,
      artistName,
      legalName,
      dni,
      address,
      territory,
      today,
    })
  );

  if (hasPublishing) {
    blocks.push({ type: "newPage" });

    blocks.push(
      ...getPublishingContractText({
        release,
        artistName,
        legalName,
        dni,
        address,
        territory,
        today,
      })
    );
  }

  /* =====================================================
     RENDERIZAR BLOQUES
  ===================================================== */

  blocks.forEach((block) => {
    if (block.type === "title") drawTitle(block.text);
    if (block.type === "paragraph") drawParagraph(block.text);
    if (block.type === "center") drawCentered(block.text);
    if (block.type === "newPage") newPage();
  });

  /* =====================================================
     FIRMA ELECTRÓNICA FINAL
  ===================================================== */

  newPage();

  drawTitle("FIRMA ELECTRÓNICA");

  drawParagraph(`Firmado por: ${legalName}`);
  drawParagraph(`Documento: ${dni}`);
  drawParagraph(`Domicilio: ${address}`);

  drawParagraph(`Fecha y hora: ${signedAt.toLocaleString("es-ES")}`);
  drawParagraph(`Dirección IP: ${ip}`);

  drawParagraph(`Identificador único del contrato: ${contractId}`);
  drawParagraph(`Hash criptográfico (SHA256): ${crypto
    .createHash("sha256")
    .update(contractId)
    .digest("hex")}`);

  /* =====================================================
     FOOTER
  ===================================================== */

  pages.forEach((p, i) => {
    p.drawText(`Contrato ID: ${contractId}`, {
      x: 50,
      y: 30,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    p.drawText(`Página ${i + 1} de ${pages.length}`, {
      x: pageWidth - 140,
      y: 30,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  return await pdfDoc.save();
}

/* =====================================================
   POST - FIRMA
===================================================== */

export async function POST(req: Request) {
  const { releaseId } = await req.json();

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: {
      artist: {
        include: {
          user: {
            include: {
              kyc: true
            }
          }
        }
      },
      tracks: {
        include: {
          masterParties: true,
          publishingCredits: true
        }
      }
    }
  });

  if (!release) {
    return new Response("Release not found", { status: 404 });
  }

  const kyc = release.artist?.user?.kyc;

  if (!kyc || kyc.status !== "APPROVED" || !kyc.documentNumber) {
    return new Response(
      "Debes completar la verificación de identidad antes de firmar el contrato.",
      { status: 403 }
    );
  }

  const kycStatus = release.artist?.user?.kyc?.status ?? "NOT_STARTED";

  if (kycStatus !== "APPROVED") {
    return new Response(
      "Debes verificar tu identidad antes de firmar el contrato.",
      { status: 403 }
    );
  }

  if (release.status !== ReleaseStatus.AWAITING_SIGNATURE) {
    return new Response("Invalid state", { status: 400 });
  }

  const signedAt = new Date();
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const contractId = crypto.randomUUID();

  const pdfBytes = await generateContractPDF({
    release,
    signedAt,
    ip,
    contractId,
  });

  /* 
  =====================================================
  PERSISTIR EN R2 (CLOUDFLARE)
  =====================================================
  */

  try {
    await uploadToR2(`contracts/${releaseId}.pdf`, Buffer.from(pdfBytes), "application/pdf");
  } catch (err) {
    console.error("[R2 Contract Upload Failed]:", err);
    // ⚠️ No bloqueamos la firma si falla el respaldo en R2, 
    // pero lo dejamos loggeado para revisión.
  }

  const hash = crypto
    .createHash("sha256")
    .update(Buffer.from(pdfBytes))
    .digest("hex");

  await prisma.release.update({
    where: { id: releaseId },
    data: {
      status: ReleaseStatus.SIGNED,
      signedAt,
      signedIp: ip,
      contractHash: hash,
      contractId,
    },
  });

  /*
  =====================================================
  DISPARAR DISTRIBUCIÓN DDEX
  =====================================================
  */

  await distributeRelease(releaseId);

  // 📧 Email al Admin (Aviso de contrato firmado y envío a tiendas)
  try {
    await sendEmail({
      to: "info@hitstar.es",
      subject: `✍️ Contrato firmado: "${release.title}"`,
      html: `
        <h1>¡Contrato firmado!</h1>
        <p>El usuario <strong>${release.artist?.user?.name || release.artist?.user?.email}</strong> ha firmado el contrato para <strong>"${release.title}"</strong>.</p>
        <p>El sistema ya ha iniciado el proceso de distribución automática (DDEX).</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p><strong>Contrato ID:</strong> ${contractId}</p>
          <p><strong>Hash:</strong> ${hash}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error enviando email al admin de contrato firmado:", err);
  }

  // 📧 Enviar email con el Contrato Firmado (Resend pro)
  try {
    await sendEmail({
      to: release.artist?.user?.email ?? "",
      subject: `Contrato firmado | ${release.title}`,
      html: `
        <h1>Contrato firmado correctamente</h1>
        <p>Tu contrato para el lanzamiento <strong>"${release.title}"</strong> ha sido firmado y registrado con éxito.</p>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; text-align: left; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>ID de Contrato:</strong> ${contractId}</p>
          <p style="margin: 5px 0 0; font-size: 14px;"><strong>Hash (SHA256):</strong> ${hash}</p>
        </div>
        <p>Adjuntamos la copia en PDF de tu contrato para tus archivos.</p>
      `,
      attachments: [
        {
          filename: `Contrato-${release.title}.pdf`,
          content: Buffer.from(pdfBytes),
        },
      ],
    });
  } catch (err) {
    console.error("Error enviando email de contrato:", err);
  }

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Contrato-${release.title}.pdf"`,
    },
  });
}