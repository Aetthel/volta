import { auth } from "@/auth";
import prisma from "backend/db";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = params;

  try {
    // Verificar que la cita pertenezca al negocio
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.businessId !== session.user.id) {
      return NextResponse.json({ error: "No encontrado o acceso denegado" }, { status: 404 });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
