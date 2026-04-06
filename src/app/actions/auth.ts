"use server";

import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/* =========================
   LOGIN
========================= */

export async function loginAction(prevState: any, formData: FormData) {

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Missing fields" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return { error: "Invalid credentials" };
  }

  if (!user.verified) {
    return { error: "Debes verificar tu email antes de iniciar sesión" };
  }

  const token = await signToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}

/* =========================
   REGISTER
========================= */

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const ipi = formData.get("ipi") as string | null;
  const pro = formData.get("pro") as string | null;
  const terms = formData.get("terms");

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Missing fields" };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  if (!terms) {
    return { error: "Debes aceptar los términos y condiciones" };
  }

  /* =========================
   VALIDATE IPI (optional)
========================= */

if (ipi && !/^[0-9]{9,11}$/.test(ipi)) {
  return { error: "El IPI debe tener entre 9 y 11 números" };
}

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  /* 🔁 SI YA EXISTE Y NO ESTÁ VERIFICADO → REENVIAR */
  if (existingUser) {
    if (existingUser.verified) {
      return { error: "Email already in use" };
    }

    await prisma.emailVerification.deleteMany({
      where: { userId: existingUser.id },
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.emailVerification.create({
      data: {
        userId: existingUser.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verifica tu cuenta | HitStar",
      html: `
        <h1>Verifica tu cuenta</h1>
        <p>Parece que ya tienes una cuenta pendiente de activación en HitStar. Haz clic abajo para verificar tu email y empezar a distribuir tu música:</p>
        <div style="margin-top: 30px;">
          <a href="${verificationUrl}" class="btn">
            Verificar cuenta
          </a>
        </div>
      `,
    });

    redirect("/verify-required");
  }

  /* 🆕 CREAR USUARIO NUEVO */

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER",
      verified: false,
      onboardingCompleted: false,
    },
  });

  /* =========================
     CREATE RIGHTS HOLDER
  ========================= */

  await prisma.rightsHolder.create({
    data: {
      userId: user.id,
      name,
      email,
      ipi: ipi || null,
      pro: pro || null,
    },
  });

  const verificationToken = crypto.randomBytes(32).toString("hex");

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${verificationToken}`;

  await sendEmail({
    to: email,
    subject: "Bienvenido a HitStar | Verifica tu cuenta",
    html: `
      <h1>¡Bienvenido a HitStar!</h1>
      <p>Gracias por unirte a la plataforma de distribución musical más avanzada. Solo falta un paso para activar tu cuenta:</p>
      <div style="margin-top: 30px;">
        <a href="${verificationUrl}" class="btn">
          Verificar cuenta ahora
        </a>
      </div>
      <p style="margin-top: 30px; font-size: 13px;">Este enlace caduca en 24 horas.</p>
    `,
  });

  redirect("/verify-required");
}

/* =========================
   REENVIAR VERIFICACIÓN
========================= */

export async function resendVerificationAction(
  prevState: any,
  formData: FormData
) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email requerido" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.verified) {
    return { success: true };
  }

  await prisma.emailVerification.deleteMany({
    where: { userId: user.id },
  });

  const verificationToken = crypto.randomBytes(32).toString("hex");

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${verificationToken}`;

  await sendEmail({
    to: email,
    subject: "Reenvío de verificación | HitStar",
    html: `
      <h1>Verifica tu email</h1>
      <p>Has solicitado un nuevo enlace de verificación. Haz clic en el botón para activar tu acceso:</p>
      <div style="margin-top: 30px;">
        <a href="${verificationUrl}" class="btn">
          Verificar email
        </a>
      </div>
    `,
  });

  return { success: true };
}

/* =========================
   LOGOUT
========================= */

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}