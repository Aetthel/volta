import { auth } from "@/auth";
import prisma from "backend/db";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  const session = await auth();

  if (!session || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { welcomeMessage, reminderMessage } = await req.json();

    const business = await prisma.business.update({
      where: { id: session.user.id },
      data: {
        welcomeMessage,
        reminderMessage,
      },
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error("[API_SETTINGS_PATCH]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
