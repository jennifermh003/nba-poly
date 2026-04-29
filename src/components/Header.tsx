'use client';

import React from 'react';

interface HeaderProps {
  connectionStatus: 'live' | 'reconnecting' | 'disconnected' | 'polling';
  lastUpdated: string | null;
}

const statusConfig: Record<
  HeaderProps['connectionStatus'],
  { color: string; text: string; pulse: boolean }
> = {
  live: { color: '#22c55e', text: 'Updates live via WebSocket', pulse: true },
  reconnecting: { color: '#f59e0b', text: 'Reconnecting...', pulse: true },
  disconnected: { color: '#9d9e9f', text: 'Connection lost', pulse: false },
  polling: { color: '#3b82f6', text: 'Polling every 60s', pulse: true },
};

const pulseKeyframes = `
@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;

export function Header({ connectionStatus, lastUpdated }: HeaderProps) {
  const { color, text, pulse } = statusConfig[connectionStatus];

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          textAlign: 'center',
          padding: '16px 20px 4px',
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.3px',
            color: 'var(--text-primary, #0a0a1a)',
            margin: 0,
          }}
        >
          2026 NBA Playoffs
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 5,
            fontSize: 11,
            color: 'var(--text-muted, #9d9e9f)',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: color,
              animation: pulse ? 'statusPulse 2s infinite' : 'none',
            }}
          />
          <span>
            Live from Polymarket &middot; {text}
          </span>
        </div>
        {lastUpdated && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted, #9d9e9f)',
              marginTop: 4,
            }}
          >
            Last updated: {lastUpdated}
          </div>
        )}
      </div>
    </>
  );
}
