import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const releaseId = searchParams.get("releaseId");

  if (!releaseId) {
    return new Response("Missing releaseId", { status: 400 });
  }

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
  });

  if (!release?.contractPdf) {
    return new Response("Contrato no disponible", { status: 404 });
  }

  return new Response(release.contractPdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Contrato-${release.title}.pdf"`,
    },
  });
}