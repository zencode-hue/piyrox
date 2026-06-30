import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Tag, Ticket } from "lucide-react";
import CreateDiscountForm from "./CreateDiscountForm";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  await requireAdmin();

  const codes = await db.discountCode.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, code: true, type: true, value: true, usageCount: true, usageLimit: true, expiresAt: true },
  });

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tag size={24} className="text-orange-400" />
            Discount Codes
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Manage your store's active promotional codes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Create form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <CreateDiscountForm />
        </div>

        {/* List of codes */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="admin-card overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket size={16} className="text-orange-400" /> Active & Expired Codes
              </h2>
            </div>
            
            {codes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <Tag size={40} className="text-zinc-700 mb-4" />
                <p className="text-zinc-400 font-medium text-lg">No codes yet</p>
                <p className="text-zinc-500 text-sm mt-1">Create a discount code to start your first promotion.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-500 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th className="text-left px-5 py-4 font-semibold">Code</th>
                      <th className="text-left px-5 py-4 font-semibold">Type</th>
                      <th className="text-right px-5 py-4 font-semibold">Value</th>
                      <th className="text-right px-5 py-4 font-semibold">Usage</th>
                      <th className="text-left px-5 py-4 font-semibold">Status / Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    {codes.map((c) => {
                      const isExpired = new Date(c.expiresAt) < new Date();
                      const isMaxedOut = c.usageCount >= c.usageLimit;
                      const isActive = !isExpired && !isMaxedOut;

                      return (
                        <tr key={c.id} className={`hover:bg-white/[0.02] transition-colors ${!isActive ? 'opacity-60' : ''}`}>
                          <td className="px-5 py-4">
                            <span className="font-mono text-[13px] font-bold text-orange-400 tracking-wider bg-orange-500/10 px-2 py-1 rounded">
                              {c.code}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-zinc-400 text-xs font-semibold tracking-wider">
                            {c.type}
                          </td>
                          <td className="px-5 py-4 text-right text-white font-bold tabular-nums">
                            {c.type === "PERCENTAGE" ? `${Number(c.value)}%` : `$${Number(c.value).toFixed(2)}`}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min(100, (c.usageCount / c.usageLimit) * 100)}%` }} />
                              </div>
                              <span className="text-zinc-400 font-medium">{c.usageCount}/{c.usageLimit}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {isExpired ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-red-500/10 text-red-400 tracking-wider">Expired</span>
                            ) : isMaxedOut ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-zinc-500/20 text-zinc-400 tracking-wider">Limit Reached</span>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-green-500/10 text-green-400 tracking-wider w-max mb-1">Active</span>
                                <span className="text-[11px] text-zinc-500">til {new Date(c.expiresAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
