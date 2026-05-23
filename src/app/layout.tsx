import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'PiyRox Chat — AI by PiyRox',
  description: 'The conversational powerhouse. Powered by PiyRox frontier models.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#212121] text-gray-100 antialiased">{children}</body>
    </html>
  );
}
