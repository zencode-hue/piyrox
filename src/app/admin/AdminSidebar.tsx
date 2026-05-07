"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import MetraMartLogo from "@/components/MetraMartLogo";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, UserCheck, Settings, Menu,
  TrendingUp, ExternalLink, FileText, BarChart2,
  AlertTriangle, Webhook, ClipboardList, Mail, Search,
  Bot, Shield, Globe, Zap, Star, MessageSquare,
  ChevronDown, ChevronRight,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/admin/seo", label: "SEO Tools", icon: Globe },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/pending-stock", label: "Pending Stock", icon: AlertTriangle },
      { href: "/admin/discounts", label: "Discounts", icon: Tag },
      { href: "/admin/deals", label: "Deal Vault", icon: Zap },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/users", label: "All Users", icon: Users },
      { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
      { href: "/admin/partners", label: "Partners", icon: TrendingUp },
      { href: "/admin/staff", label: "Staff", icon: Users },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/email", label: "Email Center", icon: Mail },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/admin/ai", label: "AI Assistant", icon: Bot },
      { href: "/admin/ip-lookup", label: "IP Lookup", icon: Search },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/security", label: "Security", icon: Shield },
      { href: "/admin/webhook-logs", label: "Webhook Logs", icon: Webhook },
      { href: "/admin/audit-log", label: "Audit Log", icon: ClipboardList },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/setup", label: "Setup", icon: Settings },
    ],
  },
];

// Flat list for mobile current label lookup
const allNavItems = navGroups.flatMap((g) => g.items);

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav className="flex-1 py-3 px-2.5 overflow-y-auto space-y-0.5">
      {navGroups.map((group) => {
        const isCollapsed = collapsed[group.label];
        const hasActive = group.items.some((item) =>
          pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
        );

        return (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => setCollapsed((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors"
              style={{ color: hasActive ? "rgba(245,158,11,0.7)" : "rgba(255,255,255,0.2)" }}>
              {group.label}
              {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
            </button>

            {!isCollapsed && group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} onClick={onClick}
                  style={{
                    display: "flex", alignItems: "center", gap: "9px",
                    padding: "8px 10px", borderRadius: "10px",
                    fontSize: "12.5px", fontWeight: 500,
                    transition: "all 0.15s ease",
                    color: active ? "#fff" : "rgba(255,255,255,0.45)",
                    background: active ? "rgba(245,158,11,0.12)" : "transparent",
                    border: active ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent",
                    marginBottom: "1px",
                  }}>
                  <Icon size={14} style={{ color: active ? "#f59e0b" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  {label}
                  {active && <div style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const currentLabel = allNavItems.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label ?? "Admin";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col fixed h-full z-30"
        style={{ background: "rgba(6,6,6,0.97)", borderRight: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
        <div className="h-14 flex items-center gap-2.5 px-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <MetraMartLogo size={24} />
          <span className="font-bold text-white text-sm">MetraMart</span>
          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }}>
            ADMIN
          </span>
        </div>
        <NavLinks pathname={pathname} />
        <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Link href="/" target="_blank" className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            <ExternalLink size={11} /> View Store
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(6,6,6,0.97)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
        <button onClick={() => setOpen(true)} className="transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
          <Menu size={20} />
        </button>
        <MetraMartLogo size={22} />
        <span className="font-bold text-white text-sm">MetraMart Admin</span>
        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{currentLabel}</span>
      </div>

      <div className="lg:hidden h-14" />

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
          <aside className="relative w-64 flex flex-col z-50 h-full"
            style={{ background: "rgba(6,6,6,0.99)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="h-14 flex items-center gap-2.5 px-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <MetraMartLogo size={22} />
              <span className="font-bold text-white text-sm">MetraMart Admin</span>
            </div>
            <NavLinks pathname={pathname} onClick={() => setOpen(false)} />
            <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <Link href="/" className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                <ExternalLink size={11} /> View Store
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
