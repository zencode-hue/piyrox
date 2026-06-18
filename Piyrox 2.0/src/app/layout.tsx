import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "@/components/providers";
import AdminAIBar from "@/components/admin/AdminAIBar";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import AdminLayout from "./admin/layout";
import StorefrontLayout from "./(storefront)/layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PIYROX - Premium Digital Products",
  description: "Get instant access to premium digital products - streaming subscriptions, AI tools, software licenses, and gaming products at the best prices.",
};

// Google Analytics
export const GoogleAnalytics = () => {
  if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    return (
      <>
        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `,
          }}
        />
      </>
    );
  }
  return null;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
        <Providers>
          <Suspense fallback={null}>
            {children}
          </Suspense>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}