import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { db } from '@/lib/db';
import HeroSection from '@/components/storefront/HeroSection';
import ProductCard from '@/components/storefront/ProductCard';
import TabbedCategories from '@/components/storefront/TabbedCategories';
import TopProductsSection from '@/components/storefront/TopProductsSection';
import FeaturedCategories from '@/components/storefront/FeaturedCategories';
import TrustBadges from '@/components/storefront/TrustBadges';
import NewsletterSection from '@/components/storefront/NewsletterSection';
import CommunitySection from '@/components/storefront/CommunitySection';

import { ArrowRight, Zap, Lock, Gem, Shield, Clock, Star, CheckCircle } from 'lucide-react';
import { getSiteSettings } from '@/lib/server-data';

export const metadata: Metadata = {
  title: 'PIYROX — Premium Digital Marketplace',
  description: 'PIYROX is your #1 digital marketplace for premium digital products. Instant delivery, secure payments, and unbeatable prices.',
  keywords: ['digital marketplace', 'premium subscriptions', 'instant delivery', 'secure payments', 'digital products'],
  openGraph: {
    title: 'PIYROX — Premium Digital Marketplace',
    description: 'Premium digital products with instant delivery and secure payments.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'PIYROX',
    type: 'website',
  },
};

async function getProductsByCategory(category: string, take = 4) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await (db.product.findMany as any)({
      where: { isActive: true, category },
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
    }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }>;
    return products.map((p) => ({
      id: p.id, title: p.title, price: Number(p.price), category: p.category,
      imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
      unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
    }));
  } catch {
    return [];
  }
}

async function getFeatured() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await (db.product.findMany as any)({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
    }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }>;
    return products.map((p) => ({
      id: p.id, title: p.title, price: Number(p.price), category: p.category,
      imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
      unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeatured>> = [];
  let streaming: Awaited<ReturnType<typeof getFeatured>> = [];
  let aiTools: Awaited<ReturnType<typeof getFeatured>> = [];
  let gaming: Awaited<ReturnType<typeof getFeatured>> = [];
  let software: Awaited<ReturnType<typeof getFeatured>> = [];
  let siteSettings: Awaited<ReturnType<typeof getSiteSettings>> = {};

  try {
    [featured, streaming, aiTools, gaming, software, siteSettings] = await Promise.all([
      getFeatured(),
      getProductsByCategory('STREAMING', 4),
      getProductsByCategory('AI_TOOLS', 4),
      getProductsByCategory('GAMING', 4),
      getProductsByCategory('SOFTWARE', 4),
      getSiteSettings(),
    ]);
  } catch (error) {
    console.warn('Could not fetch homepage data during build', error);
  }

  const discordUrl = siteSettings['discord_url'] || process.env.DISCORD_SERVER_URL || 'https://discord.gg/piyrox';
  const telegramUrl = siteSettings['telegram_url'] || '';
  const discordMembers = siteSettings['discord_members'] || '1,000+';
  const telegramMembers = siteSettings['telegram_members'] || '';

  const categorySections = [
    { id: 'STREAMING', label: 'Streaming', products: streaming },
    { id: 'AI_TOOLS', label: 'AI Tools', products: aiTools },
    { id: 'GAMING', label: 'Gaming', products: gaming },
    { id: 'SOFTWARE', label: 'Software', products: software },
  ].filter((s) => s.products.length > 0);

  return (
    <>
      {/* ── 1. Hero ── */}
      <HeroSection />

      {/* ── 2. Trust Badges ── */}
      <TrustBadges />

      {/* ── 3. Top Products (admin-curated) ── */}
      <TopProductsSection />



      {/* ── 4. Unified Features / Why Us ── */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 mb-3">
              The PiyRox Advantage
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Why Choose Us?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Delivery',
                desc: 'Credentials in your inbox instantly after payment. Fully automated.',
              },
              {
                icon: Shield,
                title: 'Secure & Encrypted',
                desc: 'AES-256-GCM encryption. Zero data exposure.',
              },
              {
                icon: Gem,
                title: 'Unbeatable Prices',
                desc: 'Netflix, Spotify, AI tools and more at massive discounts.',
              },
              {
                icon: CheckCircle,
                title: 'Replacement Guarantee',
                desc: 'Verified products with guaranteed replacements if things go wrong.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/10 border border-orange-500/20">
                    <item.icon size={22} className="text-orange-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Featured Products ── */}
      {featured.length > 0 && (
        <section className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">New Arrivals</h2>
                <p className="text-white/60 text-sm mt-1">Latest digital products added to the store</p>
              </div>
              <Link
                href="/products"
                className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Tabbed Categories ── */}
      <TabbedCategories categories={categorySections} />

      {/* ── 7. Featured Categories Grid ── */}
      <FeaturedCategories />

      {/* ── 10. Community Section ── */}
      <CommunitySection
        discordUrl={discordUrl}
        telegramUrl={telegramUrl}
        discordMembers={discordMembers}
        telegramMembers={telegramMembers}
      />

      {/* ── 11. FAQ ── */}
      <section className="border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">
              Support
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Are your subscriptions safe?',
                a: 'Yes, we provide secure and tested accounts for all services. Every product is verified before listing and comes with a replacement guarantee if anything goes wrong.',
              },
              {
                q: 'How fast is delivery?',
                a: 'Most orders are delivered instantly after payment confirms. Our automated system sends credentials to your email within seconds — no waiting, no manual processing.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes. In case of issues with your order, we provide support and a replacement or refund. Contact us on Discord within 24 hours of purchase.',
              },
              {
                q: 'How does delivery work?',
                a: 'After payment confirms, your digital product credentials are automatically sent to your registered email. Instant, no manual steps required.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept crypto via Paymento.io (BTC, ETH, USDT, 100+ coins), Binance gift cards, Discord manual payment, and wallet balance.',
              },
              {
                q: 'Why are your prices cheaper than official plans?',
                a: 'We source subscriptions in bulk and pass the savings on to you. All products are legitimate and fully functional.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl transition-all glass-card"
              >
                <summary className="p-5 cursor-pointer font-semibold text-white text-sm flex items-center justify-between list-none select-none">
                  {item.q}
                  <span className="text-white/40 group-open:rotate-180 transition-transform duration-200 ml-4 shrink-0">
                    ▾
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm text-white/60 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Newsletter ── */}
      <NewsletterSection />

      {/* ── 13. SEO Hidden Sections ── */}
      <section className="sr-only" aria-hidden="false">
        <h2>Affordable Premium Subscriptions in One Place</h2>
        <p>
          PIYROX is your trusted platform to buy cheap Netflix, Spotify, IPTV, and gaming subscriptions at the best prices.
          We provide instant delivery, secure payments, and reliable access to your favorite digital services worldwide.
          Whether you need a cheap Netflix subscription, affordable Spotify Premium, or discounted AI tools — we have it all.
        </p>
      </section>

      <section className="sr-only" aria-hidden="false">
        <h2>Cheap Netflix, Spotify & IPTV Subscriptions</h2>
        <p>
          Looking for cheap Netflix subscriptions or affordable Spotify Premium accounts? PIYROX offers some of the best deals online.
          Whether you want IPTV for unlimited channels or discounted streaming services, we provide high-quality access at unbeatable prices.
          Our shop specializes in cheap digital subscriptions — from Netflix and Spotify to ChatGPT Plus, gaming keys, and AI tools.
          All products come with instant automated delivery and a replacement guarantee, making us the most reliable place to buy affordable streaming services.
        </p>
      </section>

      <section className="sr-only" aria-hidden="false">
        <h2>How It Works</h2>
        <ol>
          <li>Choose your subscription from our shop</li>
          <li>Make a secure payment with crypto or gift card</li>
          <li>Receive your account credentials instantly by email</li>
          <li>Start streaming immediately</li>
        </ol>
      </section>
    </>
  );
}
