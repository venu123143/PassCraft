/**
 * Tailwind theme. Every colour points at a CSS variable defined in
 * src/index.css, so switching the `.dark` class on <html> re-themes the
 * whole app without changing any class names.
 *
 * Loaded from src/index.css via `@config` (Tailwind v4).
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        stage: 'var(--stage)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        success: 'var(--success)',
        pass: {
          DEFAULT: 'var(--pass)',
          foreground: 'var(--pass-foreground)',
          muted: 'var(--pass-muted)',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pass: '1.375rem',
      },
      boxShadow: {
        pass: '0 1px 2px rgb(13 30 66 / 0.18), 0 18px 40px -12px rgb(13 30 66 / 0.45)',
      },
      keyframes: {
        sheen: {
          from: { transform: 'translateX(-120%) skewX(-18deg)' },
          to: { transform: 'translateX(220%) skewX(-18deg)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(6px) scale(0.98)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        sheen: 'sheen 900ms cubic-bezier(0.4, 0, 0.2, 1) 1',
        'pop-in': 'pop-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
    },
  },
}
