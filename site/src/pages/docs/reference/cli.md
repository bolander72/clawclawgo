---
layout: ../../../layouts/DocLayout.astro
title: CLI Reference
---

# CLI Reference

Run with `npx` (no install required):

```bash
npx clawclawgo <command>
```

## Commands

### `add`

Clone a kit repo and run a security scan on it.

```bash
npx clawclawgo add <repo-url|owner/repo> [--dest dir] [--force]
```

**Options:**

| Flag | Description |
|------|-------------|
| `<repo>` | GitHub URL or `owner/repo` shorthand |
| `--dest <dir>` | Where to clone (defaults to current directory) |
| `--force` | Clone even if scan finds blocking issues |

Clones the repo (shallow, no `.git` history), finds all SKILL.md files and agent configs, runs a security scan, and reports what it found.

**Examples:**

```bash
npx clawclawgo add garrytan/gstack
npx clawclawgo add https://github.com/anthropics/skills --dest ~/kits
```

### `pack`

Scan a directory for agent skills and configs, output a portable `kit.json`.

```bash
npx clawclawgo pack [dir] [--out file]
```

**Options:**

| Flag | Description |
|------|-------------|
| `[dir]` | Directory to scan (defaults to current directory) |
| `--out <file>` | Write to file instead of stdout |

**What it detects:**
- `SKILL.md` files (Agent Skills standard — 30+ compatible agents)
- `CLAUDE.md` (Claude Code)
- `.cursorrules` (Cursor)
- `.windsurfrules` (Windsurf)
- `AGENTS.md` (OpenClaw, Codex)
- `codex.json` (Codex)
- `.clinerules` (Cline)
- `.aider.conf.yml` (Aider)
- `.continue/config.json` (Continue)

Security scan results are baked into the output.

**Examples:**

```bash
npx clawclawgo pack ~/my-skills --out kit.json
npx clawclawgo pack .
```

### `scan`

Run the security scanner on any kit file. Checks for prompt injection, shell exfiltration, credential access, PII, and dangerous commands.

```bash
npx clawclawgo scan <file>
```

Outputs a trust score (0-100) and list of findings. See [Security](/docs/guide/security) for details.

### `preview`

Pretty-print a kit summary — skills, compatibility, scan results.

```bash
npx clawclawgo preview <file>
```

### `publish`

Submit your repo to the ClawClawGo registry. Detects your git remote, runs `pack` + `scan`, and auto-creates a PR to `registry/kits.json` via `gh` CLI.

```bash
npx clawclawgo publish [dir]
```

Requires [GitHub CLI](https://cli.github.com/) (`gh`). See [Publishing](/docs/guide/publishing) for details.

### `search`

Search for kits on ClawClawGo.

```bash
npx clawclawgo search <query>
```

Opens [clawclawgo.com/search](https://clawclawgo.com/search) with your query.

## Environment

- Node.js 18+
- `git` (for `add` command)
- `gh` CLI (optional, for `publish` command)

## From Source

```bash
git clone https://github.com/bolander72/clawclawgo
cd clawclawgo
chmod +x cli/clawclawgo.mjs
./cli/clawclawgo.mjs --help
```
