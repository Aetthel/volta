import { VoltaNavigationDrawer } from "@/components/dashboard/volta-ui/navigation-drawer";

export default function BusinessLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <VoltaNavigationDrawer />
      <main className="flex-1 p-8 md:p-14 lg:p-20 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
