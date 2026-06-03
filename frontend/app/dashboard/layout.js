import BusinessSidebar from "@/components/dashboard/sidebar";

export default function BusinessLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <BusinessSidebar />
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
