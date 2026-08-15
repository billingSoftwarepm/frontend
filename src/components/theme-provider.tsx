'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Applies the theme to <html> and persists the choice. Dark is the default;
 * the light theme is opt-in via the `light` class on the document element.
 * The initial class is set by an inline script in layout.tsx to avoid a flash
 * of the wrong theme before hydration.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Sync React state with the class the no-flash script already applied.
  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    setThemeState(isLight ? 'light' : 'dark');
  }, []);

  const setTheme = useCallback((t: Theme) => {
    const el = document.documentElement;
    // Enable smooth colour transitions only while switching.
    el.classList.add('theme-anim');
    if (t === 'light') el.classList.add('light');
    else el.classList.remove('light');
    try {
      localStorage.setItem('theme', t);
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
    setThemeState(t);
    window.setTimeout(() => el.classList.remove('theme-anim'), 250);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
