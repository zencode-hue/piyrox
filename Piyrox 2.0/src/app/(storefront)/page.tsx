import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { db } from '@/lib/db';
import HeroSection from '@/components/storefront/HeroSection';
import ProductCard from '@/components/storefront/ProductCard';
import FeaturedCategories from '@/components/storefront/FeaturedCategories';
import TrustBadges from '@/components/storefront/TrustBadges';
import NewsletterSection from '@/components/storefront/NewsletterSection';
import CommunitySection from '@/components/storefront/CommunitySection';
import LiveOrderTicker from '@/components/storefront/LiveOrderTicker';
import { ArrowRight, Zap, Lock, Gem, Flame, Shield, Clock, Star, CheckCircle } from 'lucide-react';
import DealCard from '@/components/storefront/DealCard';
import DealCountdown from '@/components/storefront/DealCountdown';
import { getDealsData, getSiteSettings } from '@/lib/server-data';

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
  let dealsData: Awaited<ReturnType<typeof getDealsData>> = { deals: [], resetAt: new Date().toISOString() };
  let siteSettings: Awaited<ReturnType<typeof getSiteSettings>> = {};

  try {
    [featured, streaming, aiTools, gaming, software, dealsData, siteSettings] = await Promise.all([
      getFeatured(),
      getProductsByCategory('STREAMING', 4),
      getProductsByCategory('AI_TOOLS', 4),
      getProductsByCategory('GAMING', 4),
      getProductsByCategory('SOFTWARE', 4),
      getDealsData(),
      getSiteSettings(),
    ]);
  } catch (error) {
    console.warn('Could not fetch homepage data during build', error);
  }

  const discordUrl = siteSettings['discord_url'] || process.env.DISCORD_SERVER_URL || 'https://discord.gg/piyrox';
  const telegramUrl = siteSettings['telegram_url'] || '';
  const discordMembers = siteSettings['discord_members'] || '1,000+';
  const telegramMembers = siteSettings['telegram_members'] || '';
  const dealsEnabled = siteSettings['deals_enabled'] !== 'false';

  const hotDeals = dealsData.deals.slice(0, 4);
  const dealsResetAt = dealsData.resetAt;

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

      {/* ── 3. Live Order Ticker ── */}
      <LiveOrderTicker />

      {/* ── 4. How It Works ── */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Gem,
                title: 'Browse & Select',
                desc: 'Explore our curated catalog of premium digital subscriptions. Find Netflix, Spotify, ChatGPT Plus and more at unbeatable prices.',
              },
              {
                step: '02',
                icon: Shield,
                title: 'Secure Payment',
                desc: 'Pay safely with crypto, Binance gift cards, or wallet balance. All transactions are encrypted and processed instantly.',
              },
              {
                step: '03',
                icon: Zap,
                title: 'Instant Delivery',
                desc: 'Receive your product credentials in your inbox within seconds. Fully automated — no waiting, no manual steps.',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative group rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1 glass-card"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {item.step}
                  </span>
                </div>

                <div className="flex justify-center mb-5 mt-2">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center glass-card"
                  >
                    <item.icon size={24} className="text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>

                {/* Connector line (hidden on last + mobile) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t border-dashed border-white/10" />
                )}
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

      {/* ── 6. Hot Deals ── */}
      {dealsEnabled && hotDeals.length > 0 && (
        <section
          className="border-t border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    HOT DEALS
                    <span
                      className="text-xs font-normal px-2 py-0.5 rounded-full text-white/70"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    >
                      LIMITED TIME
                    </span>
                  </h2>
                  <p className="text-xs mt-0.5 text-white/60">
                    Deals refresh daily at midnight UTC
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <DealCountdown resetAt={dealsResetAt} />
                <Link
                  href="/deals"
                  className="flex items-center gap-1.5 text-sm font-semibold text-white/60 hover:text-white transition-colors"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hotDeals.map((deal) => (
                <DealCard key={deal.id} {...deal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Category Sections ── */}
      {categorySections.map((section) => (
        <section
          key={section.id}
          className="border-t border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Top {section.label} Products
              </h2>
              <Link
                href={`/products?category=${section.id}`}
                className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
              >
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {section.products.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── 8. Featured Categories ── */}
      <FeaturedCategories />

      {/* ── 9. Why Choose PIYROX ── */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">
              Why Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Why Choose PIYROX?
            </h2>
            <p className="text-white/60 mt-3 max-w-lg mx-auto">
              Trusted by thousands of customers in 50+ countries
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Delivery',
                desc: 'Credentials hit your inbox the moment payment confirms. Fully automated — no waiting, no manual steps, ever.',
              },
              {
                icon: Lock,
                title: 'Secure & Encrypted',
                desc: 'All inventory encrypted with AES-256-GCM. Payments processed through trusted providers with zero data exposure.',
              },
              {
                icon: Gem,
                title: 'Unbeatable Prices',
                desc: 'Get Netflix, Spotify, IPTV and more at prices far below official plans. Bulk sourcing, savings passed to you.',
              },
              {
                icon: Clock,
                title: '24/7 Live Support',
                desc: 'Real humans on Discord around the clock. Open a ticket and get a response within minutes — not hours.',
              },
              {
                icon: Star,
                title: '4.7★ Customer Rating',
                desc: 'Thousands of verified reviews from happy customers across 50+ countries. We deliver on every promise.',
              },
              {
                icon: CheckCircle,
                title: 'Replacement Guarantee',
                desc: 'Every product is verified before listing. If anything goes wrong, we replace it — no questions asked.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 glass-card"
              >
                <div className="flex justify-center mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center glass-card"
                  >
                    <item.icon size={22} className="text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                a: 'We accept crypto via NOWPayments (BTC, ETH, USDT, 100+ coins), Binance gift cards, Discord manual payment, and wallet balance.',
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