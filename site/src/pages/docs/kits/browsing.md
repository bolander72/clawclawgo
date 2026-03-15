---
layout: ../../../layouts/DocLayout.astro
title: Browsing Kits
---

# Browsing Kits

Find kits on ClawClawGo using the web app or CLI.

## Web App

Visit [clawclawgo.com](https://clawclawgo.com) to search and browse.

### Search

Use the search bar on the homepage. Results show:
- Kit name and description
- Compatible agents
- Trust tier badge
- Author and source
- Tags

Click a kit to see the full detail page — skills with links to their source code, agent compatibility, and ways to add the kit.

### Explore

The [Explore](https://clawclawgo.com/explore) page shows kits from all sources (GitHub, ClawHub, skills.sh, registry).

### Filter by Agent

Use the agent filter dropdown on the search page to find kits for a specific agent (Claude Code, Cursor, OpenClaw, etc.).

### Filter by Tag

Click a tag on any kit card to filter by category. Common tags:
- `voice`, `coding`, `automation`, `email`, `calendar`, `smart-home`, `devops`, `security`

## CLI

```bash
npx clawclawgo search "voice assistant"
```

Opens the search results on [clawclawgo.com](https://clawclawgo.com/search).

## Adding a Kit

From a kit's detail page, you can:

1. **View on GitHub** — go straight to the source repo
2. **Clone it** — `git clone` one-liner
3. **Use the CLI** — `npx clawclawgo add owner/repo` clones the repo and runs a security scan

The CLI `add` command is the recommended way — it clones, scans, and reports what skills it found in one step.

```bash
npx clawclawgo add garrytan/gstack
npx clawclawgo add https://github.com/anthropics/skills --dest ~/kits
```

## Next Steps

- [Creating Kits](/docs/kits/creating) — Make your own
- [Sharing Kits](/docs/kits/sharing) — Publish to the registry
- [Security](/docs/guide/security) — Understanding trust scores
