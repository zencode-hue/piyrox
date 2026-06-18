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



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
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