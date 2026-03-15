---
layout: ../../../layouts/DocLayout.astro
title: Kits Overview
---

# Kits Overview

A kit is a GitHub repo containing a collection of agent skills and configs. Think of it as a portable skill pack for AI agents.

## What's in a Kit

### Skills

Skills are directories with `SKILL.md` files following the [Agent Skills](https://agentskills.io) standard:

```markdown
---
name: voice-assistant
description: Process voice commands and respond with TTS
agents: [openclaw, cursor, windsurf]
tools: [exec, read, write]
---

# Voice Assistant

When the user sends a voice message:
1. Transcribe with Whisper
2. Process the command
3. Generate response with TTS
```

Skills can include scripts, config files, and assets alongside the SKILL.md.

### Agent Configs

Config files tell agents how to behave:

| File | Agent |
|------|-------|
| `CLAUDE.md` | Claude Code |
| `.cursorrules` | Cursor |
| `.windsurfrules` | Windsurf |
| `AGENTS.md` | OpenClaw, Codex |
| `codex.json` | Codex |
| `.clinerules` | Cline |
| `.aider.conf.yml` | Aider |
| `.continue/config.json` | Continue |

## Example Structure

```
my-kit/
├── skills/
│   ├── voice-assistant/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── tts.sh
│   └── home-automation/
│       └── SKILL.md
├── .cursorrules
├── CLAUDE.md
└── README.md
```

## Kit Lifecycle

1. **Create** — Organize skills and configs in a directory
2. **Pack** — `npx clawclawgo pack` generates kit.json (for metadata/scanning)
3. **Push** — Push to GitHub
4. **Publish** — `npx clawclawgo publish` adds to the registry
5. **Share** — Others clone with `npx clawclawgo add owner/repo`

## How Others Use Your Kit

```bash
npx clawclawgo add yourname/your-repo
```

This clones your repo (shallow, no git history), finds all SKILL.md files and agent configs, runs a security scan, and reports what it found. The user gets the actual skill files on disk — ready to use with their agent.

## Next Steps

- [Creating Kits](/docs/kits/creating) — How to make your own
- [Browsing Kits](/docs/kits/browsing) — Finding kits on ClawClawGo
- [Sharing Kits](/docs/kits/sharing) — Publishing to the registry
