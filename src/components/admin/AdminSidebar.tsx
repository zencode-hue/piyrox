"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  FileText, 
  BarChart, 
  Shield, 
  Settings,
  LogOut
} from 'lucide-react';
import PiyroxLogo from '../PiyroxLogo';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Discounts', href: '/admin/discounts', icon: Tag },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Security', href: '/admin/security', icon: Shield },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside style={{ 
      width: '260px', 
      height: '100vh', 
      background: 'rgba(15, 15, 15, 0.95)', 
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <PiyroxLogo size={24} />
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>PIYROX Admin</span>
      </div>

      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                color: isActive ? '#fff' : '#888',
                background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          width: '100%',
          borderRadius: '8px',
          color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.1)',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600
        }}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
