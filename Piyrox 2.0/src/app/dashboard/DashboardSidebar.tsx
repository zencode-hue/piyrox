"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import PIYROXLogo from "@/components/PIYROXLogo";
import {
  LayoutDashboard, ShoppingBag, Wallet, Users, Handshake,
  Menu, ExternalLink, Star, Settings, X, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/affiliate", label: "Promo Affiliate", icon: Users },
  { href: "/dashboard/partner", label: "Partner Program", icon: Handshake },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link 
            key={href} 
            href={href} 
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              active 
                ? "bg-white/[0.06] text-white border border-white/10" 
                : "text-zinc-400 border border-transparent hover:bg-white/[0.02] hover:text-white"
            }`}
          >
            <Icon size={15} className={`shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
            {label}
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <div className="h-16 flex items-center gap-2.5 px-5 shrink-0 border-b border-white/5">
        <PIYROXLogo size={26} />
        <span className="font-bold text-white text-sm">My Account</span>
      </div>
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 bg-white/5 border border-white/10">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Customer</p>
          </div>
        </div>
      </div>
      <NavLinks onClick={onLinkClick} />
      <div className="p-4 shrink-0 border-t border-white/5">
        <Link href="/" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors mb-3">
          <ExternalLink size={14} /> Back to Store
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors w-full text-left">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col fixed h-full z-30 bg-black/95 border-r border-white/5 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14 bg-black/95 border-b border-white/5 backdrop-blur-xl">
        <button onClick={() => setOpen(true)} className="text-zinc-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <PIYROXLogo size={22} />
        <span className="font-bold text-white text-sm">My Account</span>
      </div>
      <div className="lg:hidden h-14" />

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-72 flex flex-col z-50 h-full bg-[#09090b] border-r border-white/5 shadow-2xl">
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/5">
              <span className="font-bold text-white text-sm">My Account</span>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
