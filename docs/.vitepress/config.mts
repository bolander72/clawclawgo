import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'RipperClaw',
  description: 'Build, share, and remix AI agent builds',
  base: '/docs/',
  head: [
    ['link', { rel: 'icon', href: '/docs/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap', rel: 'stylesheet' }],
  ],
  appearance: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/what-is-ripperclaw' },
      { text: 'Builds', link: '/builds/overview' },
      { text: 'Reference', link: '/reference/schema' },
      { text: 'App', link: 'https://ripperclaw.com' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is RipperClaw?', link: '/guide/what-is-ripperclaw' },
            { text: 'Quick Start', link: '/guide/quickstart' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Blocks', link: '/guide/blocks' },
            { text: 'Exporting', link: '/guide/exporting' },
            { text: 'Applying', link: '/guide/applying' },
            { text: 'Publishing', link: '/guide/publishing' },
            { text: 'Provenance', link: '/guide/provenance' },
            { text: 'Settings', link: '/guide/settings' },
          ],
        },
      ],
      '/builds/': [
        {
          text: 'Builds',
          items: [
            { text: 'Overview', link: '/builds/overview' },
            { text: 'Creating', link: '/builds/creating' },
            { text: 'Sharing', link: '/builds/sharing' },
            { text: 'Browsing', link: '/builds/browsing' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Build Schema', link: '/reference/schema' },
            { text: 'CLI', link: '/reference/cli' },
            { text: 'Nostr Protocol', link: '/reference/nostr' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bolander72/ripperclaw' },
      { icon: 'discord', link: 'https://discord.com/invite/clawd' },
    ],
    footer: {
      message: 'MIT Licensed',
      copyright: '© 2026 RipperClaw',
    },
    search: {
      provider: 'local',
    },
    editLink: {
      pattern: 'https://github.com/bolander72/ripperclaw/edit/main/docs/:path',
    },
  },
})
