/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'rc-bg': 'var(--rc-bg)',
        'rc-surface': 'var(--rc-surface)',
        'rc-border': 'var(--rc-border)',
        'rc-cyan': 'var(--rc-cyan)',
        'rc-magenta': 'var(--rc-magenta)',
        'rc-green': 'var(--rc-green)',
        'rc-yellow': 'var(--rc-yellow)',
        'rc-red': 'var(--rc-red)',
        'rc-text': 'var(--rc-text)',
        'rc-text-dim': 'var(--rc-text-dim)',
        'rc-text-muted': 'var(--rc-text-muted)',
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
