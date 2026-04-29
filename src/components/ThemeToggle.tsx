'use client';

import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const baseButton: React.CSSProperties = {
    padding: '6px 16px',
    borderRadius: 6,
    border: 'none',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  const activeStyle: React.CSSProperties = {
    ...baseButton,
    background: 'var(--card-bg, #fff)',
    color: 'var(--text-primary, #0a0a1a)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const inactiveStyle: React.CSSProperties = {
    ...baseButton,
    background: 'rgba(0,0,0,0.05)',
    color: 'var(--text-secondary, #6c6e6f)',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 4,
        padding: '16px 16px 0',
      }}
    >
      <button
        type="button"
        onClick={theme === 'dark' ? onToggle : undefined}
        style={theme === 'light' ? activeStyle : inactiveStyle}
      >
        Light
      </button>
      <button
        type="button"
        onClick={theme === 'light' ? onToggle : undefined}
        style={theme === 'dark' ? activeStyle : inactiveStyle}
      >
        Dark
      </button>
    </div>
  );
}
