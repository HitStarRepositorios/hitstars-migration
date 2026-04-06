"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { ReleaseStatus } from "@prisma/client";
import { generateUPC } from "@/lib/codes";
import { generateCatalogNumber } from "@/lib/codes"
import { uploadToSupabase } from "@/lib/supabaseStorage";

/* ======================================================
   CREAR RELEASE → CREA BORRADOR (DRAFT)
====================================================== */

export async function createReleaseAction(
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

const user = await prisma.user.findUnique({
  where: { id: session.id },
  include: {
    artist: true,
    kyc: true,
  },
});

  if (!user?.artist) return { error: "No artist profile found" };

  const title = formData.get("title");
  const releaseDateStr = formData.get("releaseDate");
  const distributionTypeRaw = formData.get("distributionType");

  // 🔒 Validación fuerte y segura
  if (!title || typeof title !== "string") {
    return { error: "Título obligatorio." };
  }

  if (!releaseDateStr || typeof releaseDateStr !== "string") {
    return { error: "Fecha obligatoria." };
  }

  if (
    !distributionTypeRaw ||
    typeof distributionTypeRaw !== "string" ||
    !["SINGLE", "EP", "ALBUM"].includes(distributionTypeRaw)
  ) {
    return { error: "Selecciona un tipo de lanzamiento válido." };
  }

  const releaseDate = new Date(releaseDateStr);

let release;

try {

const upc = await generateUPC()
const catalogNumber = await generateCatalogNumber()

release = await prisma.release.create({
  data: {
    artistId: user.artist.id,
    title,
    releaseDate,
    distributionType: distributionTypeRaw,
    status: "DRAFT",
    upc,
    catalogNumber
  },
});
  } catch (error) {
    console.error(error);
    return { error: "No se pudo crear el borrador." };
  }

  redirect(`/dashboard/releases/${release.id}/edit`);
}
/* ======================================================
   ACTUALIZAR INFO
====================================================== */
export async function updateReleaseInfoAction(
  releaseId: string,
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const artistName = formData.get("artistName") as string;
  const releaseDateStr = formData.get("releaseDate") as string;
  const genre = formData.get("genre") as string;
  const language = formData.get("language") as string;
  const distributionType = formData.get("distributionType") as string;
  const nextStep = formData.get("nextStep") as string;

  if (!title || !artistName || !releaseDateStr || !genre) {
    return { error: "Título, artista, fecha y género son obligatorios." };
  }

  const artist = await prisma.artist.findUnique({
    where: {
      userId: session.id,
    },
  });

  if (!artist) {
    return { error: "Artist profile not found." };
  }

  /* UPDATE RELEASE */

  await prisma.release.update({
    where: { id: releaseId },
    data: {
      title,
      releaseDate: new Date(releaseDateStr),
      genre,
      language,
      distributionType,
      artistId: artist.id,
    },
  });

  /* UPDATE RELEASE ARTIST */

  await prisma.releaseArtist.deleteMany({
    where: {
      releaseId,
      isPrimary: true,
    },
  });

  await prisma.releaseArtist.create({
    data: {
      releaseId,
      artistName,
      isPrimary: true,
    },
  });

  /* 🔥 REFRESH + REDIRECT */

  revalidatePath(`/dashboard/releases/${releaseId}/edit`);

  redirect(`/dashboard/releases/${releaseId}/edit?step=${nextStep}`);
}
/* ======================================================
   ACTUALIZAR PORTADA (SIN BIND - ESTABLE)
====================================================== */

export async function updateReleaseCoverAction(
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const releaseId = formData.get("releaseId") as string;
  const coverFile = formData.get("cover") as File;

  if (!releaseId) return { error: "Release inválido." };
  if (!coverFile || coverFile.size === 0) {
    return { error: "Debes subir una imagen." };
  }

  const arrayBuffer = await coverFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const metadata = await sharp(buffer).metadata();

    if (metadata.width !== 3000 || metadata.height !== 3000) {
      return {
        error: "La portada debe ser exactamente 3000x3000 píxeles.",
      };
    }

    if (!["jpeg", "jpg", "png"].includes(metadata.format || "")) {
      return {
        error: "La portada debe ser JPG o PNG.",
      };
    }

    // Subir a Supabase Storage (Bucket 'covers')
    const filename = `${releaseId}.jpg`;
    const publicUrl = await uploadToSupabase("covers", filename, buffer, "image/jpeg");

    await prisma.release.update({
      where: { id: releaseId },
      data: {
        coverUrl: publicUrl,
      },
    });

  } catch (error) {
    console.error(error);
    return { error: "Error procesando la imagen." };
  }

  revalidatePath(`/dashboard/releases/${releaseId}/edit`);
  return { success: true };
}

export async function updateTrackCreditsAction(
  trackId: string,
  prevState: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const composer = formData.get("composer") as string;
  const publisher = formData.get("publisher") as string;
  const iswc = formData.get("iswc") as string;
  const lyrics = formData.get("lyrics") as string;

  try {
    await prisma.track.update({
      where: { id: trackId },
      data: {
        composer,
        publisher,
        iswc,
        lyrics,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "No se pudieron guardar los créditos." };
  }

  return { success: true };
}

/* ======================================================
   ENVIAR A REVISIÓN
====================================================== */

export async function submitReleaseForReviewAction(releaseId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
  });

  if (!release) return { error: "Release not found" };
  if (release.status !== "DRAFT") {
    return { error: "Este lanzamiento ya fue enviado." };
  }

  if (!release.title || !release.releaseDate || !release.coverUrl) {
    return { error: "Información incompleta. Añade portada y datos básicos." };
  }

  await prisma.release.update({
    where: { id: releaseId },
    data: { status: "PENDING" },
  });

  // 📧 Email al Admin (Aviso de nuevo lanzamiento para revisar)
  try {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    await sendEmail({
      to: "info@hitstar.es",
      subject: `Nuevo lanzamiento pendiente: "${release.title}"`,
      html: `
        <h1>Nuevo lanzamiento para revisar</h1>
        <p>El usuario <strong>${user?.name || user?.email}</strong> ha enviado un nuevo lanzamiento para aprobación.</p>
        <p>Título: <strong>${release.title}</strong></p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/releases" class="btn">
            Ir al panel de revisión
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error enviando email al admin:", err);
  }

  revalidatePath("/dashboard/releases");
  revalidatePath("/admin/releases");

  return { success: true };
}

/* ======================================================
   REJECT (ADMIN)
====================================================== */


export async function rejectReleaseAction(
  releaseId: string,
  _unused: any,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const admin = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!admin || admin.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const reason = formData.get("reason") as string;

  if (!reason) {
    return { error: "Debes indicar un motivo de rechazo." };
  }

  await prisma.release.update({
    where: { id: releaseId },
    data: {
      status: ReleaseStatus.REJECTED,
      rejectionReason: reason,
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });

  revalidatePath("/admin/releases");
  revalidatePath("/dashboard/releases");

  redirect("/admin/releases"); // 👈 ESTA LÍNEA ES LA CLAVE
}


/* ======================================================
   APROBAR (ADMIN)
====================================================== */
export async function approveReleaseAction(releaseId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const admin = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!admin || admin.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  // 🔥 1. Actualizamos estado
  await prisma.release.update({
    where: { id: releaseId },
    data: {
      status: ReleaseStatus.AWAITING_SIGNATURE,
      rejectionReason: null,
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });

  // 🔥 2. Volvemos a buscar con include (tipado correcto)
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: {
      artist: {
        include: { user: true },
      },
    },
  });

  if (!release) return { error: "Release not found" };

  // 📧 Email con Dispatcher Corporativo
  try {
    await sendEmail({
      to: release.artist.user.email,
      subject: `¡Tu lanzamiento "${release.title}" ha sido aprobado! 🎉`,
      html: `
        <h1>¡Gran noticia!</h1>
        <p>Tu lanzamiento <strong>"${release.title}"</strong> ha superado la revisión técnica y ha sido aprobado.</p>
        <p>El siguiente paso es firmar el contrato de distribución para que podamos enviar tu música a las tiendas.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/releases/${release.id}/edit" class="btn">
            Firmar Contrato ahora
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error enviando email de aprobación:", err);
  }

    // 4️⃣ Revalidamos
  revalidatePath("/admin/releases");
  revalidatePath("/dashboard/releases");

  // 5️⃣ Redirigimos (esto es lo que faltaba)
  redirect("/admin/releases");
}

/* ======================================================
   ELIMINAR RELEASE
====================================================== */

export async function deleteReleaseAction(releaseId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: { artist: true },
  });

  if (!release) return { error: "Release no encontrado" };

  // 🔐 Estados eliminables
  const deletableStatuses = [
    "DRAFT",
    "REJECTED",
    "AWAITING_SIGNATURE",
  ];

  if (!deletableStatuses.includes(release.status)) {
    return { error: "No puedes eliminar este lanzamiento." };
  }

  // 🔒 Protección extra: si ya hay firma, no permitir
  if (release.signedAt || release.contractHash) {
    return { error: "Este contrato ya fue firmado y no puede eliminarse." };
  }

  await prisma.release.delete({
    where: { id: releaseId },
  });

  revalidatePath("/dashboard/releases");
  revalidatePath("/admin/releases");

  redirect("/dashboard/releases");
}

export async function sendToDistributionAction(releaseId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const admin = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!admin || admin.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
  });

  if (!release) return { error: "Release not found" };

  if (release.status !== ReleaseStatus.SIGNED) {
    return { error: "El lanzamiento no está firmado." };
  }

  await prisma.release.update({
    where: { id: releaseId },
    data: {
      status: ReleaseStatus.DISTRIBUTING,
      distributedAt: new Date(),
    },
  });

  // 📧 Email al Usuario (Confirmación de envío a tiendas)
  try {
    const fullRelease = await prisma.release.findUnique({
      where: { id: releaseId },
      include: { artist: { include: { user: true } } }
    });

    if (fullRelease?.artist?.user?.email) {
      await sendEmail({
        to: fullRelease.artist.user.email,
        subject: `🚀 Tu lanzamiento "${fullRelease.title}" ha sido enviado a las tiendas`,
        html: `
          <h1>¡En camino!</h1>
          <p>Tu lanzamiento <strong>"${fullRelease.title}"</strong> ya ha sido enviado a los servicios de streaming seleccionados.</p>
          <p>En las próximas 24-48 horas empezará a aparecer en las plataformas. Te avisaremos en cuanto esté disponible ("LIVE").</p>
        `,
      });
    }
  } catch (err) {
    console.error("Error enviando email de distribución:", err);
  }

  revalidatePath("/admin/releases");
  revalidatePath("/dashboard/releases");

  return { success: true };
}