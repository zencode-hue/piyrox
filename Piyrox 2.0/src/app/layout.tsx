import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://piyrox.sbs";
const APP_NAME = "PIYROX";
const APP_DESCRIPTION = "PIYROX is your #1 premium digital marketplace for Netflix, Spotify, ChatGPT Plus, gaming keys and software licenses. Featuring Piyrox AI for instant support. Automated delivery. Secure crypto payments. Unbeatable prices.";
const OG_IMAGE = `${APP_URL}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "PIYROX — Premium Digital Subscriptions at Unbeatable Prices",
    template: "%s | PIYROX",
  },
  description: APP_DESCRIPTION,
  keywords: [
    "buy digital products", "streaming subscriptions", "Netflix subscription cheap",
    "Spotify premium discount", "affordable IPTV", "ChatGPT Plus account cheap",
    "gaming keys instant", "software licenses online", "instant delivery digital goods",
    "crypto payment digital store", "buy Netflix account online", "buy Spotify account 2026",
    "digital marketplace", "PIYROX", "piyrox.sbs", "Piyrox AI",
    "digital subscriptions instant", "best price subscriptions", "instant digital delivery crypto",
    "buy Disney Plus cheap", "buy IPTV subscription online", "cheap AI tools subscription",
    "buy Midjourney subscription", "buy Claude Pro online", "buy Xbox Game Pass cheap",
    "digital goods instant delivery", "crypto digital store", "buy software license cheap",
    "Netflix UHD cheap", "Spotify premium lifetime",
  ],
  authors: [{ name: "PIYROX", url: APP_URL }],
  creator: "PIYROX",
  publisher: "PIYROX",
  category: "shopping",
  applicationName: "PIYROX",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "PIYROX",
    title: "PIYROX — Premium Digital Subscriptions at Unbeatable Prices",
    description: APP_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "PIYROX — Premium Digital Subscriptions",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@piyrox",
    creator: "@piyrox",
    title: "PIYROX — Premium Digital Subscriptions at Unbeatable Prices",
    description: APP_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/piyrox_icon.png",
    shortcut: "/piyrox_icon.png",
    apple: "/piyrox_apple_icon.png",
  },
  alternates: {
    canonical: APP_URL,
  },
  verification: {
    // Add Google Search Console verification token here when available
    // google: "your-token",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PIYROX",
    alternateName: "PIYROX Marketplace",
    url: APP_URL,
    description: APP_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${APP_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PIYROX",
    url: APP_URL,
    logo: `${APP_URL}/piyrox_icon.png`,
    sameAs: [
      "https://twitter.com/piyrox",
      "https://discord.gg/piyrox",
    ],
    description: APP_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${APP_URL}/support`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "PIYROX",
    url: APP_URL,
    description: APP_DESCRIPTION,
    priceRange: "$1 - $500",
    currenciesAccepted: "USD",
    paymentAccepted: "Cryptocurrency, Gift Card",
  },
];

import CustomerAIChat from "@/components/CustomerAIChat";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://ipapi.co" />
        <link rel="dns-prefetch" href="https://nowpayments.io" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Analytics — defer to avoid render blocking */}
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="eaaiCjFWJryD0qKxQzgRgw"
          defer
        />
      </head>
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
        <CustomerAIChat />
      </body>
    </html>
  );
}
