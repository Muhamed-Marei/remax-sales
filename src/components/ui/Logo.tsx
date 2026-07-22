import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  showText?: boolean;
  text?: string;
  href?: string;
  className?: string;
}

export default function Logo({
  size = 'md',
  showText = true,
  text = 'SaleTrack',
  href,
  className = '',
}: LogoProps) {
  let dimension = 36;
  if (typeof size === 'number') {
    dimension = size;
  } else if (size === 'sm') {
    dimension = 28;
  } else if (size === 'md') {
    dimension = 38;
  } else if (size === 'lg') {
    dimension = 56;
  }

  const logoContent = (
    <div
      className={`logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        userSelect: 'none',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          width: `${dimension}px`,
          height: `${dimension}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          background: 'var(--surface-color)',
          padding: '4px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          flexShrink: 0,
        }}
      >
        <img
          src="/logo.svg"
          alt="Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'var(--logo-filter)',
            transition: 'filter var(--transition-fast)',
          }}
        />
      </div>

      {showText && (
        <span
          style={{
            fontWeight: 800,
            fontSize: dimension >= 48 ? '1.5rem' : dimension >= 36 ? '1.25rem' : '1.1rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
