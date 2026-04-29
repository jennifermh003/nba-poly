'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage may be unavailable (SSR, privacy mode, etc.)
  }

  return 'light';
}

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  // Apply the theme class to document.body on mount and whenever it changes
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';

      try {
        localStorage.setItem('theme', next);
      } catch {
        // Silently ignore if localStorage is unavailable
      }

      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
