"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import PIYROXLogo from "@/components/PIYROXLogo";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, UserCheck, Settings, Menu, X,
  TrendingUp, ExternalLink, FileText, BarChart2,
  AlertTriangle, Webhook, ClipboardList, Mail, Search,
  Bot, Shield, Globe, Zap, Star, MessageSquare,
  ChevronDown, ChevronRight, Megaphone, Share2,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/admin/social", label: "Social Automation", icon: Share2 },
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
      { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
      { href: "/admin/partners", label: "Partners", icon: TrendingUp },
      { href: "/admin/staff", label: "Staff", icon: Users },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
      { href: "/admin/email", label: "Email Center", icon: Mail },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/admin/ai", label: "AI Assistant", icon: Bot },
      { href: "/admin/tools", label: "Admin Tools", icon: Zap },
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
      { href: "/admin/setup", label: "Setup Guide", icon: Settings },
    ],
  },
];

const allNavItems = navGroups.flatMap((g) => g.items);

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1 scrollbar-hide">
      {navGroups.map((group) => {
        const groupHasActive = group.items.some((item) => isActive(pathname, item.href, item.exact));
        const isCollapsed = collapsed[group.label];

        return (
          <div key={group.label} className="mb-2">
            <button
              onClick={() => setCollapsed((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5"
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest ${groupHasActive ? "text-orange-400" : "text-zinc-600"}`}>
                {group.label}
              </span>
              {isCollapsed
                ? <ChevronRight size={10} className="text-zinc-600" />
                : <ChevronDown size={10} className="text-zinc-600" />
              }
            </button>

            {!isCollapsed && group.items.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClick}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-0.5 group ${
                    active
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`flex-shrink-0 transition-colors ${active ? "text-orange-400" : "text-zinc-600 group-hover:text-zinc-300"}`}
                  />
                  <span className="truncate">{label}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />}
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

  const currentLabel = allNavItems.find((n) => isActive(pathname, n.href, n.exact))?.label ?? "Admin";

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside
        className="hidden lg:flex w-60 shrink-0 flex-col fixed h-full z-30"
        style={{
          background: "rgba(10,10,15,0.95)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Logo */}
        <div
          className="h-14 flex items-center gap-2.5 px-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <PIYROXLogo size={26} />
          <span className="font-bold text-white text-sm tracking-tight">PIYROX</span>
          <span className="ml-auto text-[9px] font-black px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
            Admin
          </span>
        </div>

        <NavLinks pathname={pathname} />

        {/* Footer */}
        <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink size={12} /> View Storefront
          </Link>
        </div>
      </aside>

      {/* ── Mobile Top Bar ────────────────────────────────────── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16"
        style={{
          background: "rgba(10,10,15,0.97)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <PIYROXLogo size={24} />
          <div className="flex flex-col leading-tight">
            <span className="font-black text-white text-[13px] tracking-tight">PIYROX</span>
            <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest">Admin Console</span>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all active:scale-90"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="lg:hidden h-16" />

      {/* ── Mobile Bottom Nav ──────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-2 pointer-events-none">
        <div
          className="max-w-md mx-auto pointer-events-auto h-16 flex items-center justify-around px-2 rounded-2xl shadow-2xl"
          style={{
            background: "rgba(10,10,15,0.97)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {[
            { href: "/admin", icon: LayoutDashboard, label: "Home", exact: true },
            { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
            { href: "/admin/products", icon: Package, label: "Products" },
            { href: "/admin/ai", icon: Bot, label: "AI" },
          ].map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
                  active
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 scale-105"
                    : "text-zinc-500"
                }`}
              >
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[9px] mt-0.5 font-bold uppercase tracking-tighter ${active ? "block" : "hidden"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-12 text-zinc-500 rounded-xl active:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ── Mobile Sidebar Overlay ─────────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[100] flex animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside
            className="relative w-[280px] flex flex-col z-50 h-full animate-in slide-in-from-left duration-300 shadow-2xl"
            style={{
              background: "rgba(10,10,15,0.98)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="h-16 flex items-center justify-between px-5 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2.5">
                <PIYROXLogo size={24} />
                <span className="font-black text-white text-sm">
                  PIYROX <span className="text-orange-400">Admin</span>
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks pathname={pathname} onClick={() => setOpen(false)} />
            </div>
            <div className="p-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-sm font-semibold transition-all hover:bg-orange-500/20"
              >
                <ExternalLink size={14} /> View Storefront
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}