"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";

export async function submitKycAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { kyc: true }
  });

  if (!user) return { error: "User not found" };

  if (user.kyc?.status === "APPROVED") {
    return { error: "Tu identidad ya está verificada." };
  }

  const dniFile = formData.get("dni") as File;

  if (!dniFile || dniFile.size === 0) {
    return { error: "Debes subir tu documento de identidad." };
  }

  // ⚠️ De momento solo guardamos registro en DB
  // (Luego añadimos almacenamiento real tipo S3)

  await prisma.document.create({
    data: {
      userId: user.id,
      type: "DNI",
      url: "mock-upload-path", // luego lo haremos real
    },
  });

  await prisma.kycVerification.upsert({
    where: { userId: user.id },
    update: { status: "PENDING" },
    create: {
      userId: user.id,
      status: "PENDING"
    }
  });

  // 📧 Email al Admin (Aviso de KYC pendiente)
  try {
    await sendEmail({
      to: "info@hitstar.es",
      subject: `🛡️ Verificación de identidad: ${user.name || user.email}`,
      html: `
        <h1>Nuevo KYC recibido</h1>
        <p>El usuario <strong>${user.name || user.email}</strong> ha subido su documento de identidad para revisión.</p>
        <div style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/kyc" class="btn">
            Ir a verificar identidad
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error enviando email de KYC al admin:", err);
  }

  redirect("/dashboard/kyc");
}