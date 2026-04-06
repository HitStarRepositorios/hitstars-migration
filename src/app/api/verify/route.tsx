import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const record = await prisma.emailVerification.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.redirect(
      new URL("/verify-required?error=invalid", request.url)
    );
  }

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { verified: true },
  });

  await prisma.emailVerification.delete({
    where: { token },
  });

  const jwt = await signToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  const response = NextResponse.redirect(
    new URL("/dashboard", request.url)
  );

  response.cookies.set("session", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}