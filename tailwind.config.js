/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neoYellow: 'var(--neo-yellow)',
        neoCyan: 'var(--neo-cyan)',
        neoPink: 'var(--neo-pink)',
        neoPurple: 'var(--neo-purple)',
        neoOrange: 'var(--neo-orange)',
        neoGreen: 'var(--neo-green)',
        neoBg: 'var(--neo-bg)',
        neoSurface: 'var(--neo-surface)',
        neoSurfaceMuted: 'var(--neo-surface-muted)',
        neoText: 'var(--neo-text)',
        neoMuted: 'var(--neo-muted)',
        neoBorder: 'var(--neo-border)',
        neoOverlay: 'var(--neo-overlay)'
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px var(--neo-shadow)',
        'neo-sm': '2px 2px 0px 0px var(--neo-shadow)',
        'neo-lg': '6px 6px 0px 0px var(--neo-shadow)'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      }
    },
  },
  plugins: [],
}
