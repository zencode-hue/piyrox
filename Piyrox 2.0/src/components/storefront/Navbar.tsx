"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu, X, Search, ShoppingCart, User,
  Home, Package, Activity, BookOpen, LogIn
} from "lucide-react";
import PIYROXLogo from "@/components/PIYROXLogo";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/storefront/CartDrawer";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/affiliate", label: "Affiliate", icon: Activity },
  { href: "/blog", label: "Blog", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { count } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Navbar container */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
        <header className="w-full max-w-7xl h-16 flex items-center justify-between px-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <PIYROXLogo size={24} />
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-xl border border-white/10">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all ${active ? 'bg-white/10 text-white shadow-sm' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                    <Icon size={14} className={active ? "text-white" : "text-white/60"} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {!isMobile && (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-white/60" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search For Products..." 
                  className="pl-9 pr-4 py-2 w-[240px] bg-white/[0.05] border border-white/10 rounded-xl text-[13px] text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] transition-all"
                />
              </form>
            )}

            <button onClick={() => setCartOpen(true)} className="relative p-2 text-white/60 hover:text-white transition-colors">
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </button>

            {isMobile ? (
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white/60 hover:text-white">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            ) : (
              session ? (
                <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2 bg-white text-black rounded-xl text-[13px] font-bold hover:bg-white/90 transition-colors">
                  <User size={14} /> Dashboard
                </Link>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-2 px-5 py-2 bg-white text-black rounded-xl text-[13px] font-bold hover:bg-white/90 transition-colors">
                  <User size={14} /> Login
                </Link>
              )
            )}
          </div>

        </header>
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-4 pb-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
              <Search size={16} className="absolute left-4 text-white/60" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search For Products..." 
                className="w-full pl-11 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] transition-all"
              />
            </form>

            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} className={`flex items-center gap-3 p-4 rounded-xl text-base font-medium transition-all ${active ? 'bg-white/10 text-white' : 'text-white/60'}`}>
                  <Icon size={18} /> {label}
                </Link>
              );
            })}

            <div className="h-px bg-white/10 my-4" />

            {session ? (
              <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full p-4 bg-white text-black rounded-xl text-base font-bold">
                <User size={18} /> Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className="flex items-center justify-center gap-2 w-full p-4 bg-white text-black rounded-xl text-base font-bold">
                <LogIn size={18} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
