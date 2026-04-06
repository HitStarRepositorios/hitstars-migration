import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LegalEntityType, DocumentType } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { uploadToSupabase } from "@/lib/supabaseStorage";
import { revalidatePath } from "next/cache";

/* ===============================
   VALIDACIONES
=============================== */

function validateDNI(dni: string) {
  const value = dni.toUpperCase();
  const regex = /^\d{8}[A-Z]$/;

  if (!regex.test(value)) return false;

  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  const number = parseInt(value.substring(0, 8), 10);
  const letter = value[8];

  return letters[number % 23] === letter;
}

function validateIBAN(iban: string) {
  const trimmed = iban.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(trimmed);
}

function calculateAge(dateString: string) {
  const birthDate = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/* ===============================
   API
=============================== */

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    // 🔎 Campos legales
    const legalEntityType = formData.get("legalEntityType") as string;
    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const nationality = formData.get("nationality") as string;
    const country = formData.get("country") as string;
    const documentType = formData.get("documentType") as string;
    const documentNumber = (formData.get("documentNumber") as string)?.toUpperCase().trim();
    const iban = (formData.get("iban") as string)?.trim();

    const dniFront = formData.get("dniFront") as File;
    const dniBack = formData.get("dniBack") as File;

    /* ===============================
       VALIDACIONES CRÍTICAS
    =============================== */

    if (
      !legalEntityType ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !country ||
      !documentType ||
      !documentNumber
    ) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben completarse." },
        { status: 400 }
      );
    }

    // 🔞 Edad mínima
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      return NextResponse.json(
        { error: "Debes ser mayor de edad para completar la verificación." },
        { status: 400 }
      );
    }

    // 🇪🇸 Validación DNI española
    if (documentType === "DNI") {
      if (!validateDNI(documentNumber)) {
        return NextResponse.json(
          { error: "DNI inválido." },
          { status: 400 }
        );
      }
    }

    // 🏦 Validación IBAN (si se envía)
    if (iban && !validateIBAN(iban)) {
      return NextResponse.json(
        { error: "IBAN inválido." },
        { status: 400 }
      );
    }

    if (!dniFront || dniFront.size === 0 || !dniBack || dniBack.size === 0) {
      return NextResponse.json(
        { error: "Debes subir ambos lados del documento (anverso y reverso)." },
        { status: 400 }
      );
    }

    /* ===============================
       GUARDAR ARCHIVOS (SUPABASE STORAGE)
    =============================== */
    const frontFilename = `${session.id}-front-${Date.now()}.jpg`;
    const backFilename = `${session.id}-back-${Date.now()}.jpg`;

    const frontUrl = await uploadToSupabase("kyc", frontFilename, dniFront, dniFront.type);
    const backUrl = await uploadToSupabase("kyc", backFilename, dniBack, dniBack.type);

    await prisma.document.createMany({
      data: [
        {
          userId: session.id,
          type: "KYC_ID_FRONT",
          url: frontUrl,
        },
        {
          userId: session.id,
          type: "KYC_ID_BACK",
          url: backUrl,
        },
      ],
    });

    /* ===============================
       ACTUALIZAR USER
    =============================== */

    await prisma.user.update({
      where: { id: session.id },
      data: {
        firstName,
        lastName,
        country,
        dateOfBirth: new Date(dateOfBirth),
      },
    });

    /* ===============================
       UPSERT KYC
    =============================== */

    await prisma.kycVerification.upsert({
      where: { userId: session.id },
      update: {
        status: "PENDING",
        rejectedReason: null,
        approvedAt: null,
        reviewedAt: null,
        legalEntityType: legalEntityType as LegalEntityType,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        nationality,
        country,
        documentType: documentType as DocumentType,
        documentNumber,
        iban: iban || null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.id,
        status: "PENDING",
        legalEntityType: legalEntityType as LegalEntityType,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        nationality,
        country,
        documentType: documentType as DocumentType,
        documentNumber,
        iban: iban || null,
      },
    });

    /* ===============================
       REVALIDAR DASHBOARD
    =============================== */

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/kyc");

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("KYC Upload Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}