---
layout: ../../../layouts/DocLayout.astro
title: What is ClawClawGo?
---

# What is ClawClawGo?

ClawClawGo is a search engine for AI agent kits — curated collections of skills packaged together. It aggregates kits from GitHub repos, indexes them, and lets you search across all of them in one place.

## The Problem

AI agents (Claude Code, Cursor, Windsurf, OpenClaw, Cline, etc.) can be extended with skills and configs. But there's no central place to find curated collections of them.

- Kits are scattered across GitHub repos with no discoverability
- No standard format (some use SKILL.md, some use .cursorrules, some use custom formats)
- No way to search across all of them
- No security scanning before use

## The Solution

ClawClawGo solves this by:

1. **Aggregating** — Pulls kits from GitHub repos into one searchable index
2. **Standardizing** — Supports the [Agent Skills](https://agentskills.io) open standard plus all major agent formats
3. **Searching** — Full-text search across all indexed kits
4. **Scanning** — Built-in security analysis with trust scores
5. **Adding** — Clone kit repos with one command: `npx clawclawgo add owner/repo`

## What's a Kit?

A kit is a GitHub repo containing a collection of skills and agent configs. Examples:

- [garrytan/gstack](https://github.com/garrytan/gstack) — 8 Claude Code skills for CEO/eng review, shipping, QA
- [anthropics/skills](https://github.com/anthropics/skills) — Anthropic's official skill collection
- [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) — Community Cursor rules

## How It Works

**For kit creators:**
1. Organize your skills and configs in a directory
2. Push to GitHub
3. Run `npx clawclawgo publish` to submit to the registry

**For kit users:**
1. Search on [clawclawgo.com](https://clawclawgo.com)
2. Click through to the kit detail page
3. Clone with `npx clawclawgo add owner/repo` or `git clone`
4. Point your agent at the downloaded skills

## Agent Skills Standard

ClawClawGo follows the [Agent Skills](https://agentskills.io) open standard. A skill is a directory with a `SKILL.md` file:

```markdown
---
name: example-skill
description: Does something useful
agents: [openclaw, cursor, windsurf]
tools: [read, write, exec]
---

# Skill Instructions

When the user asks to do X, follow these steps...
```

30+ agents support this format. See [AGENT-COMPATIBILITY.md](https://github.com/bolander72/clawclawgo/blob/main/AGENT-COMPATIBILITY.md) for the full list.

## Security

When you run `npx clawclawgo add`, the CLI clones the repo and scans all files for prompt injection, shell exfiltration, credential access, PII, and dangerous commands. Blocking issues prevent the clone from being kept (unless `--force`).

## Not OpenClaw-Specific

ClawClawGo started in the OpenClaw ecosystem but is a cross-platform search engine for any AI agent. OpenClaw is just one of 30+ supported agents.

## Open Source

ClawClawGo is MIT licensed and open source:

- **Repo:** [github.com/bolander72/clawclawgo](https://github.com/bolander72/clawclawgo)
- **Registry:** `registry/kits.json` (submit PRs to add kits)
- **CLI:** Node.js, zero dependencies — run with `npx clawclawgo`

## Next Steps

- [Get started](/docs/guide/quickstart)
- [Learn about security](/docs/guide/security)
- [Explore kits](https://clawclawgo.com/explore)
