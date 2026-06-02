import type { Metadata } from 'next';
import './globals.css';
import { Search, ShoppingCart, User, Home, Package, Star, Activity, FileText, Fingerprint } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PIYROX Market | High-Quality Enhancements',
  description: 'Providing high-quality enhancement tools to elevate your experience.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Glowing Logo Icon */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ position: 'absolute', width: '30px', height: '30px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', filter: 'blur(8px)' }}></div>
               <Fingerprint size={24} color="#fff" style={{ position: 'relative', zIndex: 1 }} />
            </div>
          </div>
          
          <ul className="nav-links">
            <li><Link href="/" className="nav-link active"><Home size={14}/> Home</Link></li>
            <li><Link href="/products" className="nav-link"><Package size={14}/> Products</Link></li>
            <li><Link href="/reviews" className="nav-link"><Star size={14}/> Reviews</Link></li>
            <li><Link href="/status" className="nav-link"><Activity size={14}/> Status</Link></li>
            <li><Link href="/blog" className="nav-link"><FileText size={14}/> Blog</Link></li>
          </ul>

          <div className="nav-right">
            <div className="search-bar">
              <Search size={14} color="#666" />
              <input type="text" placeholder="Search For Products..." />
            </div>
            <button className="cart-btn">
              <ShoppingCart size={16} color="#d4d4d4" />
            </button>
            <Link href="/login" className="login-btn">
              <User size={14} /> Login
            </Link>
          </div>
        </nav>
        
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
