---
layout: ../../../layouts/DocLayout.astro
title: Sharing
---

# Sharing Kits

## Push to GitHub

The primary way to share kits. Your skills and configs live in a GitHub repo — that's the kit.

1. Organize your skills in a directory with `SKILL.md` files
2. Push to GitHub
3. Run `npx clawclawgo publish` to submit a registry entry

Others find your kit on [clawclawgo.com](https://clawclawgo.com) and add it with:

```bash
npx clawclawgo add yourname/your-repo
```

See the [Publishing guide](/docs/guide/publishing) for full details.

## Submit to the Registry

The ClawClawGo registry at `registry/kits.json` is a lightweight URL index. Submitting adds a pointer to your repo — ClawClawGo never hosts your content.

```bash
npx clawclawgo publish
```

This runs `pack` + `scan` on your repo, then auto-creates a PR to add your entry to the registry (requires `gh` CLI).

## What Gets Shared

Your GitHub repo is the kit. When someone runs `clawclawgo add`, they get a clone of your repo with:

- Skill directories with `SKILL.md` files
- Agent config files (`.cursorrules`, `CLAUDE.md`, etc.)
- Any scripts, assets, or docs in the repo

The CLI runs a security scan after cloning so the user sees a trust report before using anything.

## Licensing

Kits on GitHub inherit your repo's license. If you include persona files (SOUL.md, etc.) with specific creative writing, consider that anyone can read and use them.
