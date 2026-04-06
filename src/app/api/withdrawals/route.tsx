import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

const MIN_WITHDRAWAL = 50

export async function POST(req: Request) {

  try {

    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.id

    const body = await req.json()
    const amount = Number(body.amount)

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: "Minimum withdrawal is €50" },
        { status: 400 }
      )
    }

    /*
    -------------------------
    GET RIGHTS HOLDER
    -------------------------
    */

    let rightsHolder = await prisma.rightsHolder.findFirst({
      where: { userId }
    })

    if (!rightsHolder) {

      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      rightsHolder = await prisma.rightsHolder.create({
        data: {
          userId,
          email: user?.email,
          name: user?.name
        }
      })

    }

    /*
    -------------------------
    CALCULATE ROYALTIES AVAILABLE
    -------------------------
    */

    const royalties = await prisma.royaltyTransaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        status: "AVAILABLE"
      }
    })

    const royaltiesAvailable = royalties._sum.amount ?? 0

    /*
    -------------------------
    CALCULATE PENDING WITHDRAWALS
    -------------------------
    */

    const pending = await prisma.royaltyTransaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "WITHDRAWAL",
        status: "PENDING"
      }
    })

    const pendingWithdrawals = Math.abs(pending._sum.amount ?? 0)

    /*
    -------------------------
    REAL AVAILABLE BALANCE
    -------------------------
    */

    const availableBalance = royaltiesAvailable - pendingWithdrawals

    if (availableBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    /*
    -------------------------
    PREVENT MULTIPLE WITHDRAWALS
    -------------------------
    */

    const pendingWithdrawal = await prisma.royaltyTransaction.findFirst({
      where: {
        userId,
        type: "WITHDRAWAL",
        status: "PENDING"
      }
    })

    if (pendingWithdrawal) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal" },
        { status: 400 }
      )
    }

    /*
    -------------------------
    CREATE WITHDRAWAL
    -------------------------
    */

    const withdrawal = await prisma.royaltyTransaction.create({
      data: {

        userId,
        rightsHolderId: rightsHolder.id,

        type: "WITHDRAWAL",
        status: "PENDING",

        amount: -amount,
        currency: "EUR",

        sourceType: "PAYOUT",

        requiresKyc: true

      }
    })

    // 📧 Email al Admin (Aviso de solicitud de retiro)
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await sendEmail({
        to: "info@hitstar.es",
        subject: `💸 Nueva solicitud de retiro: €${amount.toFixed(2)}`,
        html: `
          <h1>Solicitud de retiro recibida</h1>
          <p>El usuario <strong>${user?.name || user?.email}</strong> ha solicitado un pago por valor de <strong>€${amount.toFixed(2)}</strong>.</p>
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/withdrawals" class="btn">
              Ver solicitudes de retiro
            </a>
          </div>
        `,
      });
    } catch (err) {
      console.error("Error enviando email al admin de retiro:", err);
    }

    return NextResponse.json(withdrawal)

  } catch (error) {

    console.error("Withdrawal error:", error)

    return NextResponse.json(
      { error: "Withdrawal failed" },
      { status: 500 }
    )

  }

}