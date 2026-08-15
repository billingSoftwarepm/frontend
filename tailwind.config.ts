import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Bright blue accent (matches reference app)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#2f6bff',
          dark: '#1d4ed8',
        },
        accent: {
          DEFAULT: '#38bdf8',
          dark: '#0ea5e9',
        },
        // Themeable UI surfaces (driven by CSS variables so the app can switch
        // between dark (default) and light themes — see globals.css :root / .light)
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)', // page background
          900: 'rgb(var(--surface-900) / <alpha-value>)',
          800: 'rgb(var(--surface-800) / <alpha-value>)', // sidebar / topbar
          card: 'rgb(var(--surface-card) / <alpha-value>)', // cards
          card2: 'rgb(var(--surface-card2) / <alpha-value>)', // raised / hover
          border: 'rgb(var(--surface-border) / <alpha-value>)',
          borderlt: 'rgb(var(--surface-borderlt) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.4), 0 8px 24px -12px rgb(0 0 0 / 0.6)',
        'card-hover': '0 12px 40px -12px rgb(37 99 235 / 0.45)',
        glow: '0 0 0 3px rgb(59 130 246 / 0.25)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #38bdf8 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        'sidebar-gradient':
          'linear-gradient(180deg, rgb(var(--surface-800)) 0%, rgb(var(--surface-900)) 60%, rgb(var(--surface)) 100%)',
        'card-gradient':
          'linear-gradient(160deg, rgb(var(--surface-card2)) 0%, rgb(var(--surface-card)) 100%)',
        'auth-gradient':
          'radial-gradient(1000px 500px at 15% -10%, rgba(37,99,235,0.35) 0%, transparent 55%), radial-gradient(900px 500px at 110% 10%, rgba(56,189,248,0.25) 0%, transparent 50%), linear-gradient(180deg, #0a0f1e 0%, #070b16 100%)',
        // Ambient glow behind the app content (theme-aware via CSS vars in globals.css)
        'app-glow':
          'radial-gradient(900px 450px at 12% -8%, rgb(var(--glow-a) / 0.20) 0%, transparent 55%), radial-gradient(800px 450px at 108% 6%, rgb(var(--glow-b) / 0.16) 0%, transparent 50%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
