import { VoltaNavigationDrawer } from "@/components/dashboard/volta-ui/navigation-drawer";

const ADMIN_MENU = [
  { name: "Resumen", icon: "layout", href: "/admin" },
  { name: "Negocios", icon: "users", href: "/admin/businesses" },
  { name: "Seguridad", icon: "shield", href: "/admin/security" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <VoltaNavigationDrawer customMenu={ADMIN_MENU} brandName="Volta Admin" />
      
      <main className="flex-1 p-8 md:p-14 lg:p-20 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
