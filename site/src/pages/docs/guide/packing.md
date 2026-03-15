---
layout: ../../../layouts/DocLayout.astro
title: Packing
---

# Packing

The `pack` command scans your directory for agent config files and SKILL.md files, detects which agents they're compatible with, and generates a `kit.json`.

Security scan results are baked into the output.

## Usage

```bash
npx clawclawgo pack [directory] [--out file]
```

**Options:**
- `[dir]` — Directory to scan (defaults to current directory)
- `--out <file>` — Write to file instead of stdout

## What Gets Detected

The pack command looks for:

- **SKILL.md** — Agent Skills standard skill files
- **Agent config files:**
  - `CLAUDE.md` (Claude Code)
  - `.cursorrules` (Cursor)
  - `.windsurfrules` (Windsurf)
  - `AGENTS.md` (OpenClaw, Codex)
  - `codex.json` (Codex)
  - `.clinerules` (Cline)
  - `.aider.conf.yml` (Aider)
  - `.continue/config.json` (Continue)
  - And more — see [AGENT-COMPATIBILITY.md](https://github.com/bolander72/clawclawgo/blob/main/AGENT-COMPATIBILITY.md)

## Example

```bash
# Pack current directory
npx clawclawgo pack

# Pack a specific directory
npx clawclawgo pack ~/my-agent-skills

# Specify output file
npx clawclawgo pack --out kit.json
```

## What Goes in kit.json

The pack command generates metadata about your kit — skill names, descriptions, detected agent configs, compatibility, and security scan results. This is used by the ClawClawGo registry and web app for indexing.

See [Schema Reference](/docs/reference/schema) for the full format.

## Next Steps

Once packed:
1. Review the generated `kit.json`
2. Run `npx clawclawgo scan kit.json` to see detailed security findings
3. Push your repo to GitHub
4. Publish to the registry with `npx clawclawgo publish`
