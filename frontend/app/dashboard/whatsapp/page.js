import { auth } from "@/auth";
import prisma from "backend/db";
import WhatsAppStatusCard from "./status-card";

export default async function WhatsAppPage() {
  const session = await auth();
  const business = await prisma.business.findUnique({
    where: { id: session.user.id },
    select: {
      whatsappStatus: true,
      qrCode: true,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-400">Conexión</h2>
        <h1 className="text-5xl font-display font-bold">WhatsApp</h1>
      </header>

      <div className="max-w-2xl">
        <WhatsAppStatusCard initialData={business} />
      </div>
    </div>
  );
}
