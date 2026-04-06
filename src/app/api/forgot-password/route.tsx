import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

    // 📧 Enviar email con nuestro nuevo Dispatcher Corporativo
    await sendEmail({
      to: email,
      subject: "Restablecer contraseña | HitStar",
      html: `
        <h1>Restablecer contraseña</h1>
        <p>Has solicitado restablecer tu contraseña en HitStar. Haz clic en el botón de abajo para crear una nueva:</p>
        <div style="margin-top: 30px;">
          <a href="${resetUrl}" class="btn">
            Restablecer contraseña
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 13px;">Este enlace es válido durante 1 hora. Si no has solicitado este cambio, puedes ignorar este correo.</p>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}