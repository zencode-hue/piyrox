import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/staff/", "/api/", "/dashboard/", "/auth/", "/staff-login", "/staff-register"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/products", "/deals", "/blog", "/about", "/support", "/affiliate"],
        disallow: ["/admin/", "/staff/", "/api/", "/dashboard/", "/auth/"],
      },
    ],
    sitemap: "https://piyrox.xyz/sitemap.xml",
    host: "https://piyrox.xyz",
  };
}
