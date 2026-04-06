import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_8MW2tLbr_PvXHYMbmP8sUkqfNinPHXfqk");

const CORPORATE_COLORS = {
  background: "#0a0a0c",
  card: "#141419",
  accentPrimary: "#6d28d9", // Violet
  accentSecondary: "#db2777", // Pink
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
};

/**
 * Generates a premium branded HTML layout for HitStar emails.
 */
function getBrandedLayout(contentHtml: string, title: string = "HitStar") {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: ${CORPORATE_COLORS.background}; color: ${CORPORATE_COLORS.textPrimary}; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: ${CORPORATE_COLORS.card}; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -1px; margin-bottom: 30px; }
        .logo-text { background: linear-gradient(135deg, ${CORPORATE_COLORS.accentPrimary}, ${CORPORATE_COLORS.accentSecondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: ${CORPORATE_COLORS.accentPrimary}; }
        h1 { font-size: 24px; font-weight: 700; margin-bottom: 20px; }
        p { color: ${CORPORATE_COLORS.textSecondary}; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .btn { display: inline-block; padding: 14px 32px; border-radius: 999px; background: linear-gradient(135deg, ${CORPORATE_COLORS.accentPrimary}, ${CORPORATE_COLORS.accentSecondary}); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.4); }
        .footer { margin-top: 40px; font-size: 12px; color: #475569; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">
            <span class="logo-text">HITSTAR</span>
          </div>
          ${contentHtml}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HitStar. Todos los derechos reservados.<br>
          Distribución musical premium para artistas independientes.
        </div>
      </div>
    </body>
    </html>
  `;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
  attachments?: any[]; // NEW: Support for PDF/Image attachments
}

/**
 * Unified email sender for HitStar.
 * Ensures consistent branding and sender identity (info@hitstar.es).
 */
export async function sendEmail({ to, subject, html, text, reply_to, attachments }: SendEmailParams) {
  try {
    const brandedHtml = getBrandedLayout(html, subject);

    let result = await resend.emails.send({
      from: "HitStar <info@hitstar.es>",
      to,
      subject,
      html: brandedHtml,
      text: text || "Por favor, abre este correo en un navegador compatible con HTML para ver el contenido completo.",
      replyTo: reply_to || "info@hitstar.es",
      attachments,
    });

    if (result.error) {
      // 🧐 Inspección robusta del error de Resend
      const errorObj = result.error as any;
      const isUnverified = errorObj.statusCode === 403 || 
                          errorObj.name === "validation_error" ||
                          (errorObj.message && errorObj.message.toLowerCase().includes("not verified"));

      if (isUnverified) {
        console.warn("[Email Warning]: Dominio hitstar.es pendiente de verificación. Probando fallback de emergencia...");
        
        result = await resend.emails.send({
          from: "HitStar <onboarding@resend.dev>",
          to,
          subject: `${subject} (En espera de verificación)`,
          html: brandedHtml,
          text: text || "",
          attachments,
        });

        if (!result.error) {
          console.log("[Email Fallback Success]: Enviado vía onboarding@resend.dev");
          return { success: true, id: result.data?.id, fallback: true };
        }
        
        console.error("[Email Fallback Failed]:", result.error);
      } else {
        console.error("[Email Error]:", result.error);
      }
      
      return { success: false, error: result.error?.message || "Error desconocido" };
    }

    return { success: true, id: result.data?.id };
  } catch (error: any) {
    console.error("[Email Dispatcher Crash]:", error.message);
    return { success: false, error: error.message };
  }
}
