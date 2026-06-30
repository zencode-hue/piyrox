import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import ProductActions from "./ProductActions";
import PriceDisplay from "@/components/storefront/PriceDisplay";
import UrgencyBadges from "@/components/storefront/UrgencyBadges";
import { Star, Package, Zap, Shield, RefreshCw, CheckCircle } from "lucide-react";
import { extractProductId, productPath } from "@/lib/slug";

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};
const CATEGORY_COLORS: Record<string, string> = {
  STREAMING: "text-white bg-white/5 border-white/10",
  AI_TOOLS: "text-zinc-300 bg-white/5 border-white/10",
  SOFTWARE: "text-zinc-300 bg-white/5 border-white/10",
  GAMING: "text-zinc-300 bg-white/5 border-white/10",
};

// Generate feature bullets from description
function getFeatures(description: string, category: string): string[] {
  const base = [
    "1 year subscription — valid for 12 full months",
    "Instant automated delivery to your email",
    "AES-256 encrypted credentials",
    "Replacement guarantee if invalid",
    "24/7 customer support",
  ];
  const catFeatures: Record<string, string[]> = {
    STREAMING: ["HD/4K streaming quality", "Multi-device access", "Offline downloads available", "Ad-free experience"],
    AI_TOOLS: ["Unlimited message access", "Latest AI model included", "API access available", "Priority processing"],
    SOFTWARE: ["Full license key included", "All features unlocked", "Regular updates included", "Works on all platforms"],
    GAMING: ["Instant account/key delivery", "All DLC included", "Multi-platform support", "No region restrictions"],
  };
  return ["1 year subscription — valid for 12 full months", ...(catFeatures[category] ?? []), ...base.slice(1)].slice(0, 7);
}

interface PageProps { params: { id: string } }

type ReviewItem = { id: string; rating: number; comment: string | null; createdAt: Date; user: { name: string | null } };

async function getProduct(id: string) {
  const realId = extractProductId(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = await (db.product.findFirst as any)({
    where: { id: realId, isActive: true },
    select: {
      id: true, title: true, description: true, price: true, category: true,
      imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true,
      variants: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, price: true, stockCount: true, unlimitedStock: true },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true } } },
      },
    },
  }) as ({ id: string; title: string; description: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean; variants: Array<{ id: string; name: string; price: { toString(): string }; stockCount: number; unlimitedStock: boolean }>; reviews: ReviewItem[] } | null);

  if (!product) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related = await (db.product.findMany as any)({
    where: { category: product.category, isActive: true, id: { not: product.id } },
    take: 4, orderBy: { avgRating: "desc" },
    select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
  }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }>;

  return {
    ...product,
    price: Number(product.price),
    avgRating: Number(product.avgRating),
    inStock: product.unlimitedStock || product.stockCount > 0,
    variants: product.variants.map((v) => ({
      id: v.id, name: v.name, price: Number(v.price),
      stockCount: v.stockCount, unlimitedStock: v.unlimitedStock,
      inStock: v.unlimitedStock || v.stockCount > 0,
    })),
    relatedProducts: related.map((p) => ({
      id: p.id, title: p.title, price: Number(p.price), category: p.category,
      imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
      unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
    })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const realId = extractProductId(params.id);
  const product = await db.product.findFirst({
    where: { id: realId, isActive: true },
    select: { title: true, description: true, imageUrl: true, price: true, avgRating: true, category: true },
  });
  if (!product) return { title: "Product Not Found - PIYROX" };

  const appUrl = "https://piyrox.sbs";
  const slugUrl = `${appUrl}${productPath(realId, product.title)}`;
  const catLabel = CATEGORY_LABELS[product.category] ?? "Digital";
  const price = Number(product.price).toFixed(2);

  // Rich description for social embeds
  const ogDescription = `Buy ${product.title} for $${price} — Instant delivery to your email. ${product.description.slice(0, 100)}`;

  const ogImage = product.imageUrl
    ? [{ url: product.imageUrl, width: 1200, height: 630, alt: `${product.title} - PIYROX` }]
    : [{ url: `${appUrl}/opengraph-image`, width: 1200, height: 630, alt: "PIYROX" }];

  return {
    title: `Buy ${product.title} — $${price} | PIYROX`,
    description: `${product.title} for $${price}. ${catLabel} subscription with instant delivery. ${product.description.slice(0, 100)}`,
    alternates: { canonical: slugUrl },
    openGraph: {
      title: `${product.title} — $${price} | PIYROX`,
      description: ogDescription,
      url: slugUrl,
      siteName: "PIYROX",
      type: "website",
      images: ogImage,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@piyrox",
      title: `${product.title} — $${price} | PIYROX`,
      description: ogDescription,
      images: ogImage.map((i) => i.url),
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const features = getFeatures(product.description, product.category);
  const catColor = CATEGORY_COLORS[product.category] ?? "text-zinc-400 bg-white/5 border-white/10";
  const reviewCount = product.reviews.length;
  const avgRating = product.avgRating;
  const appUrl = "https://piyrox.sbs";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.imageUrl ?? undefined,
    url: `${appUrl}${productPath(product.id, product.title)}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${appUrl}${productPath(product.id, product.title)}`,
      seller: { "@type": "Organization", name: "PIYROX" },
    },
    ...(avgRating > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviewCount > 0 ? reviewCount : 1,
        bestRating: "5",
        worstRating: "1",
      },
    } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: appUrl },
      { "@type": "ListItem", position: 2, name: "Products", item: `${appUrl}/products` },
      { "@type": "ListItem", position: 3, name: CATEGORY_LABELS[product.category], item: `${appUrl}/products?category=${product.category}` },
      { "@type": "ListItem", position: 4, name: product.title, item: `${appUrl}${productPath(product.id, product.title)}` },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <a href="/" className="hover:text-white transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-white transition-colors">Products</a>
        <span>/</span>
        <a href={`/products?category=${product.category}`} className="hover:text-white transition-colors">{CATEGORY_LABELS[product.category]}</a>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Left — Image */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 backdrop-blur-md">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Package size={64} className="text-white/40" />
                <span className="text-zinc-500 text-sm">{CATEGORY_LABELS[product.category]}</span>
              </div>
            )}
            {/* Best seller badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-black bg-white border border-white/10 shadow-sm">
                BEST SELLER
              </span>
            </div>
          </div>

          {/* Trust badges under image */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Zap, label: "Instant Delivery", color: "text-white" },
              { icon: Shield, label: "Secure Payment", color: "text-white" },
              { icon: RefreshCw, label: "Replacement Guarantee", color: "text-white" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center bg-white/[0.02] border border-white/5 backdrop-blur-md">
                <b.icon size={16} className={b.color} />
                <span className="text-xs text-zinc-400 leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Info */}
        <div className="flex flex-col gap-5">
          {/* Category badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${catColor}`}>
              {CATEGORY_LABELS[product.category]}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} className={s <= Math.round(avgRating) ? "fill-white text-white" : "text-zinc-700"} />
              ))}
            </div>
            <span className="text-sm text-white font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-zinc-500">({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
          </div>

          {/* Price — shown as range if variants exist, otherwise base price */}
          <div className="flex items-baseline gap-3">
            {product.variants.length > 0 ? (
              <>
                <span className="text-4xl font-black text-white">
                  ${Math.min(...product.variants.map((v) => v.price)).toFixed(2)}
                  {Math.min(...product.variants.map((v) => v.price)) !== Math.max(...product.variants.map((v) => v.price)) && (
                    <span className="text-2xl font-bold text-zinc-400"> – ${Math.max(...product.variants.map((v) => v.price)).toFixed(2)}</span>
                  )}
                </span>
                <span className="text-sm text-zinc-500">select plan below</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-black text-white"><PriceDisplay usdAmount={product.price} /></span>
                <span className="text-sm text-zinc-500">USD</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>

          {/* SEO keyword content — hidden visually, readable by Google */}
          <div className="sr-only" aria-hidden="false">
            <p>
              Get access to {product.title} at a lower cost with our affordable subscription plans on PIYROX.
              Enjoy premium {CATEGORY_LABELS[product.category] ?? "digital"} access without paying full price.
              Our service is fast, reliable, and easy to use — credentials are delivered instantly after payment with no waiting.
              This is one of the best cheap {CATEGORY_LABELS[product.category]?.toLowerCase() ?? "digital"} deals available online.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">What&apos;s included:</p>
            <ul className="space-y-1.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                  <CheckCircle size={14} className="text-white shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <UrgencyBadges productId={product.id} stockCount={product.stockCount} unlimitedStock={product.unlimitedStock} />
          <ProductActions
            productId={product.id}
            productTitle={product.title}
            price={product.price}
            inStock={product.inStock}
            imageUrl={product.imageUrl}
            category={product.category}
            variants={product.variants}
          />
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star size={18} className="text-white fill-white" />
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-xl p-5 bg-white/[0.02] border border-white/5 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black bg-white">
                      {review.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="text-sm font-medium text-white">{review.user.name ?? "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} className={s <= review.rating ? "fill-white text-white" : "text-zinc-700"} />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm text-zinc-400">{review.comment}</p>}
                <p className="text-xs text-zinc-500 mt-2">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {product.relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {product.relatedProducts.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
