# ClawClawGo

The agent kits search engine. Find, explore, and add skill collections for Claude Code, Cursor, OpenClaw, and 30+ AI agents.

**[clawclawgo.com](https://clawclawgo.com)**

## What is it?

ClawClawGo is a search engine for AI agent kits — curated collections of skills packaged together. It aggregates kits from GitHub repos, indexes them, and lets you search across all of them in one place.

Kits follow the [Agent Skills](https://agentskills.io) open standard — SKILL.md files with YAML frontmatter describing what each skill does, which agents it works with, and what tools it needs.

## CLI

```bash
npx clawclawgo <command>
```

| Command | What it does |
|---------|-------------|
| `add <repo\|owner/repo>` | Clone a kit repo and scan it |
| `pack [dir]` | Pack local skills into a kit.json |
| `scan <file>` | Security scan a kit file (trust score + findings) |
| `preview <file>` | Pretty-print a kit summary |
| `publish [dir]` | Submit your repo to the registry |
| `search <query>` | Search for kits on clawclawgo.com |

### Add

Clone a kit repo to your machine. Finds all SKILL.md files and agent configs, runs a security scan, and reports what it found.

```bash
npx clawclawgo add garrytan/gstack
npx clawclawgo add https://github.com/anthropics/skills --dest ~/kits
```

### Pack

Scans your directory for agent config files and SKILL.md files, detects which agents they're compatible with, and generates a `kit.json`. Security scan results are baked into the output.

```bash
npx clawclawgo pack ~/my-skills --out kit.json
```

Detected files: SKILL.md, CLAUDE.md, .cursorrules, .windsurfrules, AGENTS.md, codex.json, .clinerules, .aider.conf.yml, .continue/config.json

### Scan

Run the security scanner on any kit. Checks for prompt injection, shell exfiltration, credential access, PII, and dangerous commands. Outputs a trust score (0-100).

```bash
npx clawclawgo scan kit.json
```

## Supported Agents

ClawClawGo works with any agent that follows the Agent Skills standard, plus agents with their own config formats:

Claude Code · Cursor · Windsurf · OpenClaw · Codex · Cline · Aider · Continue · GitHub Copilot · Gemini CLI · VS Code · Roo Code · Goose · and more

See [AGENT-COMPATIBILITY.md](AGENT-COMPATIBILITY.md) for the full list.

## Registry

The registry is a simple JSON file at `registry/kits.json`. To add your kit:

1. Push your skills to a GitHub repo
2. Run `npx clawclawgo publish` to auto-create a PR
3. Or manually add an entry to `registry/kits.json`

## Development

```bash
# Site
cd site && npm install && npm run dev

# CLI
node cli/clawclawgo.mjs --help
```

## Stack

- **Site**: Astro + React + Tailwind CSS v4
- **CLI**: Node.js (zero dependencies)

## License

MIT
