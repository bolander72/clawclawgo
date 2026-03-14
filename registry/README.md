# ClawClawGo Registry

The ClawClawGo registry is a decentralized index of agent skills and builds. It's a list of pointers to GitHub repos and other sources — not a centralized store.

## What's in the Registry?

Each entry points to a repository containing:
- Agent Skills (SKILL.md files)
- Agent-specific configs (.cursorrules, CLAUDE.md, etc.)
- Skills stacks and complete builds

## How to Add Your Repo

1. Make sure your repo contains at least one of:
   - `SKILL.md` files (Agent Skills standard)
   - `.cursorrules` (Cursor)
   - `CLAUDE.md` (Claude Code)
   - Other agent config files

2. Run `clawclawgo publish` in your repo to generate the entry

3. Submit a PR to this repo adding your entry to `registry/builds.json`

## Entry Format

```json
{
  "url": "https://github.com/username/repo",
  "name": "Build Name",
  "description": "What this build does",
  "compatibility": ["agent-skills", "claude-code", "cursor"],
  "tags": ["productivity", "coding", "automation"],
  "addedAt": "2026-03-14T22:00:00Z"
}
```

## Quality & Maintenance

- All entries are security-scanned before merging
- Broken links are checked weekly
- Entries with 404s for 30+ days are removed
- Entries flagged for security issues are removed immediately

## License

Each build maintains its own license. Check the linked repository before use.
