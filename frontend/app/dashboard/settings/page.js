import { auth } from "@/auth";
import prisma from "backend/db";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  const business = await prisma.business.findUnique({
    where: { id: session.user.id },
    select: {
      welcomeMessage: true,
      reminderMessage: true,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-400">Personalización</h2>
        <h1 className="text-5xl font-display font-bold">Mensajes</h1>
      </header>

      <div className="max-w-3xl">
        <SettingsForm initialData={business} />
      </div>
    </div>
  );
}
