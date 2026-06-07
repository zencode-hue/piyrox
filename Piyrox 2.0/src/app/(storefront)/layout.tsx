import Navbar from "@/components/storefront/Navbar";
import Providers from "@/components/storefront/Providers";
import PageViewTracker from "@/components/PageViewTracker";
import RecentPurchasePopupWrapper from "@/components/storefront/RecentPurchasePopupWrapper";
import ExitIntentPopup from "@/components/storefront/ExitIntentPopup";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Twitter,
  Send,
  Youtube,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  Users,
  CreditCard,
} from "lucide-react";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";

/* ─────────────────────────── column data ─────────────────────────── */

const productLinks = [
  ["All Products", "/products"],
  ["Streaming", "/products?category=STREAMING"],
  ["AI Tools", "/products?category=AI_TOOLS"],
  ["Software", "/products?category=SOFTWARE"],
  ["Gaming", "/products?category=GAMING"],
  ["Hot Deals", "/deals"],
] as const;

const companyLinks = [
  ["About", "/about"],
  ["Blog", "/blog"],
  ["Affiliates", "/affiliate"],
  ["Support", "/support"],
  ["Reviews", "/reviews"],
  ["Status", "/status"],
] as const;

const accountLinks = [
  ["Sign In", "/auth/login"],
  ["Register", "/auth/register"],
  ["Dashboard", "/dashboard"],
  ["Orders", "/dashboard/orders"],
  ["Wishlist", "/dashboard/wishlist"],
] as const;

const legalLinks = [
  ["Terms of Service", "/terms"],
  ["Privacy Policy", "/privacy"],
  ["Refund Policy", "/refund-policy"],
  ["Cookie Policy", "/cookie-policy"],
] as const;

/* ─────────────────────────── trust badges ────────────────────────── */

const trustBadges = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: Shield, label: "Secure Payments" },
  { icon: Clock, label: "24/7 Support" },
  { icon: CheckCircle, label: "Verified Products" },
  { icon: Users, label: "10,000+ Customers" },
] as const;

/* ──────────────────────── payment methods ────────────────────────── */

const paymentMethods = [
  { name: "Visa", icon: "V" },
  { name: "Mastercard", icon: "M" },
  { name: "PayPal", icon: "P" },
  { name: "Bitcoin", icon: "₿" },
  { name: "Ethereum", icon: "Ξ" },
] as const;

/* ─────────────────────────── social links ────────────────────────── */

const socials = [
  { icon: MessageCircle, label: "Discord", href: "https://discord.gg/piyrox" },
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com/piyrox" },
  { icon: Send, label: "Telegram", href: "https://t.me/piyrox" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@piyrox" },
] as const;

/* ═══════════════════════════ FOOTER ═══════════════════════════════ */

function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      {/* ── top row: brand + newsletter ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 py-12 border-b border-white/10">
          {/* brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                PIYROX
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Premium digital marketplace — instant delivery, secure crypto
              payments, and 500+ verified products.
            </p>
          </div>

          {/* newsletter */}
          <div className="w-full md:w-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
              Stay Updated
            </p>
            <form className="flex items-center gap-0">
              <input
                type="email"
                placeholder="you@email.com"
                className="h-10 w-full md:w-64 rounded-l-lg bg-white/5 border border-r-0 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="button"
                className="h-10 px-5 rounded-r-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[11px] text-white/60 mt-1.5">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* ── three-column nav ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 border-b border-white/10">
          {/* Products */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-4">
              Products
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-4">
              Account
            </h4>
            <ul className="space-y-2.5">
              {accountLinks.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── trust signals ── */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-8 border-b border-white/10">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/60">
              <Icon size={16} strokeWidth={1.8} />
              <span className="text-xs font-medium tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        {/* ── payment methods ── */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-8 border-b border-white/10">
          <span className="text-[11px] uppercase tracking-widest text-white/60">
            We accept
          </span>
          {paymentMethods.map(({ name, icon }) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10"
            >
              <span className="text-white text-sm leading-none">{icon}</span>
              {name}
            </span>
          ))}
        </div>

        {/* ── social links ── */}
        <div className="flex items-center justify-center gap-4 py-8 border-b border-white/10">
          {socials.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <Icon size={16} strokeWidth={1.8} />
              <span className="text-xs font-medium hidden sm:inline">
                {label}
              </span>
            </a>
          ))}
        </div>

        {/* ── bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-white/60">
          <p className="text-xs">
            © {new Date().getFullYear()} PIYROX. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span>piyrox.sbs</span>
            <span className="text-white/40">|</span>
            <span>Instant Digital Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════ STOREFRONT LAYOUT ════════════════════════ */

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <CurrencyProvider>
        <CartProvider>
          <PageViewTracker />
          <Navbar />
          <main className="min-h-screen bg-black">{children}</main>
          <Footer />
          <RecentPurchasePopupWrapper />
          <ExitIntentPopup />
        </CartProvider>
      </CurrencyProvider>
    </Providers>
  );
}