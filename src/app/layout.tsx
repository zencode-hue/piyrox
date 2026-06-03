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
const APP_DESCRIPTION = "PIYROX is your #1 digital marketplace for Netflix, Spotify, ChatGPT Plus, gaming keys and software licenses. Instant automated delivery. Secure crypto payments. Best prices guaranteed.";
const OG_IMAGE = `${APP_URL}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "PIYROX — Premium Digital Subscriptions at Unbeatable Prices",
    template: "%s | PIYROX",
  },
  description: APP_DESCRIPTION,
  keywords: [
    "buy digital products", "streaming subscriptions", "Netflix subscription",
    "Spotify premium discount", "affordable IPTV", "ChatGPT Plus cheap",
    "gaming keys", "software licenses", "instant delivery digital goods",
    "crypto payment digital store", "buy Netflix account", "buy Spotify account",
    "digital marketplace", "PIYROX", "piyrox.sbs",
    "digital subscriptions", "best price subscriptions", "instant digital delivery",
    "buy Disney Plus cheap", "buy IPTV subscription", "cheap AI tools",
    "buy Midjourney subscription", "buy Claude Pro", "buy Xbox Game Pass",
    "digital goods instant delivery", "crypto digital store", "buy software license",
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
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
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
    alternateName: "PIYROX",
    url: APP_URL,
    description: APP_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PIYROX",
    url: APP_URL,
    logo: {
      "@type": "ImageObject",
      url: `${APP_URL}/icon`,
      width: 32,
      height: 32,
    },
    sameAs: [],
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
