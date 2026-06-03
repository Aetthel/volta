import { auth } from "@/auth";
import prisma from "backend/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  // Intentar obtener sesión web
  const session = await auth();
  
  // Intentar obtener API Key del header
  const apiKey = req.headers.get("x-api-key");
  const isAuthorizedAPI = apiKey && apiKey === process.env.API_KEY;

  if (!session && !isAuthorizedAPI) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { clientName, clientPhone, appointmentDate, businessId } = await req.json();

    // Validar que el negocio pertenezca al usuario si es sesión web
    if (session && session.user.role === "BUSINESS" && session.user.id !== businessId) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientPhone,
        appointmentDate: new Date(appointmentDate),
        businessId,
        status: "PENDING",
      },
    });

    // Disparar mensaje instantáneo
    const { sendWelcomeMessage } = require("backend/bot");
    sendWelcomeMessage(appointment.id).catch(console.error);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("[API_APPOINTMENTS_POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  
  const date = dateStr ? new Date(dateStr) : new Date();
  date.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: session.user.id,
        appointmentDate: {
          gte: date,
          lte: endOfDay,
        },
      },
      orderBy: { appointmentDate: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
