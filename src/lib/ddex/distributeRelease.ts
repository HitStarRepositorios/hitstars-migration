import { prisma } from "@/lib/prisma"
import { exportRelease } from "./exportRelease"
import { sendToDSP } from "./sendToDSP"
import { assignCodes } from "./codes/assignCodes"
import { Platform, ReleaseStatus } from "@prisma/client"
import { sendEmail } from "@/lib/email"

export async function distributeRelease(releaseId: string) {

  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: { artist: { include: { user: true } } }
  })

  if (!release) {
    throw new Error("Release not found")
  }

  /*
  PREVENT DUPLICATE DISTRIBUTIONS
  */

  if (release.status === ReleaseStatus.DISTRIBUTING) {
    console.log("Distribution already running")
    return
  }

  /*
  MARK AS DISTRIBUTING
  */

  await prisma.release.update({
    where: { id: releaseId },
    data: {
      status: ReleaseStatus.DISTRIBUTING
    }
  })

  /*
  GENERATE ISRC / UPC
  */

  await assignCodes(releaseId)

  /*
  GENERATE DDEX PACKAGE (ONLY ONCE)
  */

  const zipPath = await exportRelease(releaseId)

  /*
  PLATFORMS SELECTED
  */

  const platforms = (release.distributionPlatforms ?? []) as Platform[]

  for (const dsp of platforms) {

    /*
    CREATE DELIVERY RECORD (OR REUSE)
    */

    await prisma.dSPDelivery.upsert({
      where: {
        releaseId_dsp: {
          releaseId,
          dsp
        }
      },
      update: {
        status: "PENDING"
      },
      create: {
        releaseId,
        dsp,
        status: "PENDING"
      }
    })

    try {

      /*
      SEND PACKAGE TO DSP
      */

      await sendToDSP(zipPath, dsp)

      /*
      UPDATE SUCCESS
      */

      await prisma.dSPDelivery.updateMany({
        where: { releaseId, dsp },
        data: {
          status: "SENT",
          sentAt: new Date(),
          error: null
        }
      })

    } catch (err: any) {

      console.error(`Delivery failed for ${dsp}`, err)

      /*
      UPDATE FAILURE
      */

      await prisma.dSPDelivery.updateMany({
        where: { releaseId, dsp },
        data: {
          status: "FAILED",
          error: err.message
        }
      })

    }

  }

  /*
  FINAL STATE
  */

  await prisma.release.update({
    where: { id: releaseId },
    data: {
      status: ReleaseStatus.LIVE,
      distributedAt: new Date()
    }
  })

  // 📧 Email al Usuario (¡Ya está en tiendas!)
  try {
    if (release.artist?.user?.email) {
      await sendEmail({
        to: release.artist.user.email,
        subject: `📀 Tu lanzamiento "${release.title}" ya está LIVE`,
        html: `
          <h1>¡Enhorabuena!</h1>
          <p>Tu lanzamiento <strong>"${release.title}"</strong> ya ha sido procesado por las plataformas y está disponible para tus fans.</p>
          <div style="margin-top: 30px;">
            <p>Puedes verlo aquí:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/releases" class="btn">
              Ver mis lanzamientos
            </a>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Error enviando email de LIVE:", err);
  }

}