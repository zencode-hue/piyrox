import { requireAdmin } from "@/lib/admin-auth";
import AdminSidebar from "./AdminSidebar";
import AdminAIBar from "@/components/admin/AdminAIBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen relative overflow-x-hidden" style={{ background: "#080810" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen w-full overflow-x-hidden">
        <main className="flex-1 w-full pt-20 pb-36 lg:pt-8 lg:pb-8">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <AdminAIBar />
      </div>
    </div>
  );
}
