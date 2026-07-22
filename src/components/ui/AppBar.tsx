'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import Logo from './Logo';
import { useLanguage } from '@/i18n/LanguageContext';

interface AppBarProps {
  title?: string;
  portalType?: 'sales' | 'admin';
}

export default function AppBar({ portalType = 'sales' }: AppBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, dictionary } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const homeHref = portalType === 'admin' ? '/admin' : '/dashboard';

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navItems = portalType === 'admin' 
    ? [
        { label: 'Overview', href: '/admin' },
        { label: 'Salespeople', href: '/admin/users' },
        { label: 'Activities', href: '/admin/activities' },
      ]
    : [
        { label: dictionary.app.dashboard || 'Dashboard', href: '/dashboard' },
        { label: dictionary.app.activity || 'My Activities', href: '/dashboard/activities' },
        { label: dictionary.app.deals || 'My Deals', href: '/dashboard/deals' },
        { label: 'My Leads', href: '/dashboard/leads' },
      ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        padding: '0.75rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        {/* Left / Start: Logo & Portal Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Logo href={homeHref} size="md" showText text="SaleTrack" />
          <span
            className={`badge ${portalType === 'admin' ? 'badge-primary' : 'badge-success'}`}
            style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
          >
            {portalType === 'admin' ? 'Admin Portal' : 'Sales Portal'}
          </span>
        </div>

        {/* Center / Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== homeHref && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'hsla(var(--primary-hue), 85%, 45%, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right / End: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={toggleLanguage}
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.825rem',
              borderRadius: 'var(--radius-md)',
            }}
            title="Switch Language"
          >
            🌐 {language === 'ar' ? 'English' : 'عربي'}
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.825rem',
              color: 'var(--danger)',
              borderColor: 'hsla(354, 75%, 52%, 0.3)',
            }}
          >
            {isLoggingOut ? '...' : dictionary.app.logout || 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}
