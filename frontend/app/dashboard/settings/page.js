import { auth } from "@/auth";
import prisma from "backend/db";
import { VoltaSettingsList } from "@/components/dashboard/volta-ui/settings-list";

export default async function SettingsPage() {
  const session = await auth();
  const business = await prisma.business.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div className="py-4 md:py-8">
      <VoltaSettingsList business={business} />
    </div>
  );
}
