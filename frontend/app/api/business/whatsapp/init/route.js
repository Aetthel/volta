import { auth } from "@/auth";
import whatsappManager from "backend/whatsapp";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Inicializar el cliente de WhatsApp en background
    whatsappManager.initClient(session.user.id).catch(err => {
      console.error(`[WhatsApp Init API] Failed for ${session.user.id}:`, err);
    });

    return NextResponse.json({ success: true, message: "Bot iniciándose..." });
  } catch (error) {
    return NextResponse.json({ error: "Error al iniciar el bot" }, { status: 500 });
  }
}
