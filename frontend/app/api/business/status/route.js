import { auth } from "@/auth";
import prisma from "backend/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: session.user.id },
      select: {
        whatsappStatus: true,
        qrCode: true,
      },
    });

    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
