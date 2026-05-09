import { requireAdmin } from "@/lib/admin-auth";
import AdminSidebar from "./AdminSidebar";
import AdminAIBar from "@/components/admin/AdminAIBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen relative" style={{ background: "#000" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <main className="flex-1 overflow-x-hidden pt-16 pb-32 lg:pt-0 lg:pb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {children}
          </div>
        </main>
        <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden">
           {/* Mobile spacing buffer for AI Bar above Bottom Nav */}
        </div>
        <AdminAIBar />
      </div>
    </div>
  );
}
