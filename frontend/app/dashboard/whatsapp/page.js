import { auth } from "@/auth";
import prisma from "backend/db";
import { VoltaWhatsAppCard } from "@/components/dashboard/volta-ui/whatsapp-card";

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
    <div className="py-8">
      <div className="mb-10">
        <h2 className="text-sm font-bold text-teal-600 uppercase tracking-[0.2em] mb-2">Canal de Comunicación</h2>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Automatización</h1>
      </div>

      <VoltaWhatsAppCard 
        status={business?.whatsappStatus} 
        qrCode={business?.qrCode} 
      />
    </div>
  );
}
