import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getDistributionContractText } from "@/lib/contracts/distributionContract";
import { getPublishingContractText } from "@/lib/contracts/publishingContract";
import { TERRITORY_NAMES } from "@/lib/territories";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const releaseId = searchParams.get("releaseId");

  if (!releaseId) {
    return new Response("Missing releaseId", { status: 400 });
  }

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
          publishingCredits: true,
        },
      },
    },
  });

  if (!release) {
    return new Response("Release not found", { status: 404 });
  }

  const artistName =
    release.artist?.user?.name ??
    `${release.artist?.user?.firstName ?? ""} ${release.artist?.user?.lastName ?? ""}`.trim() ??
    "EL INTÉRPRETE";

  if (release.artist?.user?.kyc?.status !== "APPROVED") {
    return new Response("KYC not approved", { status: 403 });
  }



  const kyc = release.artist?.user?.kyc;

  const legalName =
    kyc
      ? `${kyc.firstName || ""} ${kyc.lastName || ""}`.trim()
      : `${release.artist?.user?.firstName || ""} ${release.artist?.user?.lastName || ""}`.trim()
      || release.artist?.user?.name
      || "__________________________";

  const dni =
    kyc?.documentNumber ||
    release.artist?.user?.dni ||
    "__________";

  const address =
    kyc
      ? [
        kyc.addressLine1,
        kyc.addressLine2,
        kyc.city,
        kyc.state,
        kyc.postalCode,
        kyc.country
      ]
        .filter(Boolean)
        .join(", ")
      : release.artist?.user?.country
      || "__________________________";

  let territory = "Mundial";

  if (!release.distributionWorldwide) {
    const regions = release.distributionTerritories as string[] | null;

    if (regions && regions.length > 0) {
      territory = regions
        .map((r) => TERRITORY_NAMES[r] ?? r)
        .join(", ");
    }
  }

  const today = new Date().toLocaleDateString("es-ES");

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

      page.drawText(sanitizeText(line.trim()), {
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

  function drawCentered(text: string) {
    ensureSpace(30);
    const width = fontBold.widthOfTextAtSize(text, 16);
    page.drawText(text, {
      x: (pageWidth - width) / 2,
      y,
      size: 16,
      font: fontBold,
    });
    y -= 30;
  }

  const hasPublishing = release.tracks.some((track: any) =>
    track.publishingCredits?.some(
      (credit: any) => Number(credit.share) > 0
    )
  );

  const blocks: any[] = [];

  blocks.push(
    ...getDistributionContractText({
      release,
      artistName,
      legalName,
      dni,
      address,
      territory,
      today
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
        today
      })
    );
  }

  blocks.forEach((block) => {
    if (block.type === "title") drawTitle(block.text);
    if (block.type === "paragraph") drawParagraph(block.text);
    if (block.type === "center") drawCentered(block.text);
    if (block.type === "newPage") newPage();
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}