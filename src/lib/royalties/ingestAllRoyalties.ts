import { listR2Objects, downloadFromR2 } from "@/lib/r2"
import { ingestDSPReport } from "./ingestReports"
import { ingestProducerReport } from "./ingestProducerReport"
import { ingestPublishingReport } from "./ingestPublishingReport"
import { royaltyJobRunner } from "./royaltyJobRunner"
import { createRoyaltyMovements } from "./createRoyaltiesMovements"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

/**
 * Orchestrator to ingest all royalty reports from the R2 'royalties/' directory.
 */
export async function ingestAllRoyaltiesFromR2() {
  console.log("🚀 [Royalty Orchestrator]: Scanning R2 'royalties/' folder...")

  const objects = await listR2Objects("royalties/")
  
  if (objects.length === 0) {
    console.log("⚠️ [Royalty Orchestrator]: No files found in 'royalties/'")
    return { success: true, count: 0 }
  }

  let processedFiles = 0
  let totalEarnings = 0

  for (const obj of objects) {
    if (!obj.Key || obj.Key === "royalties/") continue

    const content = await downloadFromR2(obj.Key)
    if (!content) continue

    const filename = obj.Key.split("/").pop() || obj.Key
    const lowerName = filename.toLowerCase()

    try {
      if (lowerName.includes("spotify") || lowerName.includes("apple")) {
        await ingestDSPReport(filename, content)
        processedFiles++
      } else if (lowerName.includes("agedi") || lowerName.includes("producer")) {
        await ingestProducerReport(filename, content)
        processedFiles++
      } else if (lowerName.includes("sgae") || lowerName.includes("publishing")) {
        await ingestPublishingReport(filename, content)
        processedFiles++
      }
    } catch (err) {
      console.error(`💥 [Royalty Orchestrator]: Error processing ${filename}`, err)
    }
  }

  if (processedFiles > 0) {
    console.log("⚙️ [Royalty Orchestrator]: Running calculation engines...")
    await createRoyaltyMovements()
    totalEarnings = await royaltyJobRunner()

    // 📧 AVISAR A LOS USUARIOS QUE TIENEN NUEVO DINERO
    try {
      // Buscamos transacciones de tipo ROYALTY creadas en los últimos 15 minutos
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
      
      const newTransactions = await prisma.royaltyTransaction.findMany({
        where: {
          type: "ROYALTY",
          createdAt: { gte: fifteenMinutesAgo }
        },
        include: { user: true }
      })

      // Agrupamos por usuario para no enviar 100 emails al mismo
      const usersToNotify = new Map<string, { email: string; name?: string; total: number }>()
      
      for (const t of newTransactions) {
        if (!t.user.email) continue
        const existing = usersToNotify.get(t.user.id) || { email: t.user.email, name: t.user.name || undefined, total: 0 }
        existing.total += t.amount
        usersToNotify.set(t.user.id, existing)
      }

      for (const [userId, data] of usersToNotify.entries()) {
        await sendEmail({
          to: data.email,
          subject: `💰 Tienes nuevos royalties disponibles en HitStar`,
          html: `
            <h1>¡Buenas noticias!</h1>
            <p>Hola ${data.name || "Artista"},</p>
            <p>Se han procesado nuevos informes de ventas y has recibido un total de <strong>€${data.total.toFixed(2)}</strong>.</p>
            <p>Ya puedes ver el detalle en tu panel de balance y solicitar un retiro si has alcanzado el mínimo.</p>
            <div style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/financials" class="btn">
                Ver mi Balance
              </a>
            </div>
          `,
        })
      }

    } catch (emailErr) {
      console.error("Error enviando notificaciones de royalties:", emailErr)
    }
  }

  console.log(`✅ [Royalty Orchestrator]: Finished. ${processedFiles} files, ${totalEarnings} earnings.`)
  return { success: true, fileCount: processedFiles, earningCount: totalEarnings }
}
