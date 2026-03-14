---
layout: ../../../layouts/DocLayout.astro
title: Packing
---

# Packing

The `pack` command scans your directory for agent config files and SKILL.md files, detects which agents they're compatible with, and generates a `build.json`.

Security scan results are baked into the output so anyone reading the file can see the trust score.

## Usage

```bash
clawclawgo pack [directory] [options]
```

**Options:**
- `--out <file>` — Output path for build.json (default: `./build.json`)
- `--name <name>` — Build name (defaults to directory name)
- `--description <text>` — Build description

## What Gets Detected

The pack command looks for:

- **SKILL.md** — Agent Skills standard skill files
- **Agent config files:**
  - `.cursorrules` (Cursor)
  - `.windsurfrules` (Windsurf)
  - `CLAUDE.md` (Claude Code)
  - `AGENTS.md` (generic agent instructions)
  - `openclaw.json` (OpenClaw)
  - `codex.json` (Codex)
  - `.clinerules` (Cline)
  - `.aider.conf.yml` (Aider)
  - `.continue/config.json` (Continue)
  - And more — see [AGENT-COMPATIBILITY.md](https://github.com/bolander72/clawclawgo/blob/main/AGENT-COMPATIBILITY.md)

## What Goes in build.json

```json
{
  "name": "my-build",
  "description": "My collection of agent skills",
  "skills": [
    {
      "path": "skills/example/SKILL.md",
      "name": "example-skill",
      "description": "Does something useful",
      "compatibility": ["openclaw", "cursor", "windsurf"]
    }
  ],
  "configs": [
    {
      "path": ".cursorrules",
      "agent": "cursor"
    }
  ],
  "scan": {
    "score": 95,
    "findings": [],
    "timestamp": "2024-03-14T17:00:00Z"
  }
}
```

The scan results are baked in so anyone can see the trust score before using the build.

## Example

```bash
# Pack current directory
clawclawgo pack

# Pack a specific directory
clawclawgo pack ~/my-agent-skills

# Specify output file
clawclawgo pack --out my-build.json

# Add metadata
clawclawgo pack --name "Voice Assistant" --description "Skills for voice-controlled agents"
```

## Next Steps

Once packed:
1. Review the generated `build.json`
2. Run `clawclawgo scan build.json` to see detailed security findings
3. Publish to the registry with `clawclawgo publish`
