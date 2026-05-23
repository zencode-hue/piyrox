import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PiyRox | The Frontier of AI',
  description:
    'We build agentic environments. From the world\'s first AI-native OS to IDEs that write their own code, PiyRox is the ultimate platform for creators.',
  icons: { 
    icon: '/favicon-new.svg',
    apple: '/logo.svg'
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
