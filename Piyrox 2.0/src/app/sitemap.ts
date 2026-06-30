import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { productPath } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Always use the primary naked domain for SEO consistency
  const appUrl = "https://piyrox.sbs";

  const [products, blogPosts] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      select: { id: true, title: true, updatedAt: true, category: true },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }) as Promise<Array<{ slug: string; updatedAt: Date }>>,
  ]);

  const productUrls = products.map((p) => ({
    url: `${appUrl}${productPath(p.id, p.title)}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogUrls = blogPosts.map((p) => ({
    url: `${appUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Category pages
  const categories = ["STREAMING", "AI_TOOLS", "SOFTWARE", "GAMING"];
  const categoryUrls = categories.map((cat) => ({
    url: `${appUrl}/products?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  return [
    { url: appUrl,                        lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${appUrl}/products`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
    { url: `${appUrl}/deals`,             lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${appUrl}/blog`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${appUrl}/affiliate`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${appUrl}/about`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/support`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/track`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${appUrl}/privacy`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${appUrl}/terms`,             lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    ...categoryUrls,
    ...productUrls,
    ...blogUrls,
  ];
}
