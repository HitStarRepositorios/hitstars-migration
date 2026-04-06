import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const session = await getSession()
  const { id } = await params

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()
  const action = body.action

  if (!["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  }

  const status = action === "APPROVE" ? "PAID" : "CANCELLED"

  // 1. UPDATE TRANSACTION
  console.log(`[PAYOUT] Updating transaction ${id} to status: ${status}`)
  
  const withdrawal = await prisma.royaltyTransaction.update({
    where: { id },
    include: { user: true },
    data: { status }
  })

  console.log(`[PAYOUT] Transaction ${id} updated! New status: ${withdrawal.status}`)

  // 2. SYNC USER BALANCE (If APPROVED, subtract effectively)
  if (status === "PAID") {
    console.log(`[PAYOUT] Decrementing balance for user ${withdrawal.userId} by ${Math.abs(Number(withdrawal.amount))}`)
    await prisma.user.update({
      where: { id: withdrawal.userId },
      data: {
        balance: {
          decrement: Math.abs(Number(withdrawal.amount))
        }
      }
    })
    console.log(`[PAYOUT] Balance updated successfully.`)
  }

  // 📧 NOTIFICAR AL USUARIO DEL ESTADO DEL PAGO
  try {
    if (withdrawal.user.email) {
      const isApproved = status === "PAID"
      const absAmount = Math.abs(Number(withdrawal.amount)).toFixed(2)

      console.log(`[PAYOUT] Sending email to ${withdrawal.user.email}`)
      await sendEmail({
        to: withdrawal.user.email,
        subject: isApproved 
          ? `💳 Tu pago de €${absAmount} ha sido procesado`
          : `⚠️ Tu solicitud de retiro ha sido rechazada`,
        html: isApproved 
          ? `
            <h1>¡Pago procesado con éxito!</h1>
            <p>Hola ${withdrawal.user.name || "Artista"},</p>
            <p>Tu solicitud de retiro por valor de <strong>€${absAmount}</strong> ha sido aprobada y procesada.</p>
            <p>Recibirás los fondos en tu cuenta bancaria / PayPal seleccionada en un plazo de 2 a 5 días laborables.</p>
          `
          : `
            <h1>Solicitud rechazada</h1>
            <p>Hola ${withdrawal.user.name || "Artista"},</p>
            <p>Tu solicitud de retiro de <strong>€${absAmount}</strong> ha sido rechazada por el departamento de administración.</p>
            <p><strong>El saldo ha sido devuelto íntegramente a tu balance de HitStar.</strong></p>
            <p>Por favor, revisa tus datos de facturación o contacta con soporte si tienes dudas.</p>
          `,
      })
    }
  } catch (err) {
    console.error("Error enviando email de estado de pago:", err)
  }

  // ♻️ REVALIDAR CACHÉ PARA USUARIO Y ADMIN
  console.log(`[PAYOUT] Revalidating paths...`)
  revalidatePath("/admin/withdrawals")
  revalidatePath("/dashboard/analytics/movements")
  revalidatePath("/dashboard/analytics")
  revalidatePath("/dashboard")

  return NextResponse.json(withdrawal)

}