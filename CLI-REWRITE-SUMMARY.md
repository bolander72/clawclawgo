# CLI Rewrite Summary

## What Changed

Completely rewrote ClawClawGo CLI from an OpenClaw-specific build manager into a cross-platform agent skills aggregator.

### Removed (817 lines deleted)
- **`apply` command** — all workspace creation, agent config writing, build application logic
- **OpenClaw-specific code** — readConfig(), writeConfig(), gatewayRequest(), config path references
- **Dependency checking** — checkDependencies, compareVersions, formatDependencyReport
- **Setup guide resolution** — KNOWN_GUIDES, resolveGuideUrl, validateGuideUrl
- **ClawHub API calls** — fetchClawhubModeration, checkClawhubModeration (kept local scanner)
- **Schema compat helpers** — getSection() for v2/v3 builds
- **Build blocks structure** — v2/v3 schema handling
- **ajv/ajv-formats dependencies** — no longer need JSON schema validation

### Added (436 lines added)
- **`export` command** — scan directory, detect agent files, parse SKILL.md frontmatter, generate build.json
- **`scan` command** — security pattern matching (simplified, local-only)
- **`preview` command** — formatted build summary
- **`publish` command** — prepare repo for registry submission (export + scan + generate entry)
- **`search` command** — stub that redirects to web
- **Agent detection** — 9 agent platforms via file markers (SKILL.md, .cursorrules, CLAUDE.md, etc.)
- **PII scrubbing** — phone, email, address, SSN from exported content
- **YAML frontmatter parser** — simple regex-based, no dependencies
- **Registry scaffold** — builds.json + README explaining submission process

## File Changes

| File | Before | After | Change |
|------|--------|-------|--------|
| cli/clawclawgo.mjs | 1385 lines | 516 lines | -869 lines |
| package.json | v0.2.2 | v0.3.0 | Updated description, keywords, removed deps |
| registry/builds.json | — | new | Registry index (empty) |
| registry/README.md | — | new | Registry docs |

## Key Design Decisions

1. **Agent-agnostic** — no OpenClaw assumptions, works with any agent platform
2. **Detection-based** — infer compatibility from files present, not config
3. **Local-first** — no external API calls (ClawHub moderation removed)
4. **Zero dependencies** — only Node.js builtins (fs, path, child_process)
5. **Single file** — entire CLI in one 516-line file
6. **Registry = pointers** — we index repos, not host builds

## Compatibility Detection

The CLI detects agent compatibility by scanning for these markers:

| Agent | Markers |
|-------|---------|
| Agent Skills Standard | SKILL.md |
| Claude Code | CLAUDE.md, .claude/ |
| Cursor | .cursorrules, .cursor/rules/ |
| Windsurf | .windsurfrules |
| OpenClaw | AGENTS.md, openclaw.json |
| Cline | .clinerules, .cline/ |
| Aider | .aider.conf.yml |
| Continue | .continue/config.json |
| Codex | codex.json |

## Testing

```bash
# Help text
node cli/clawclawgo.mjs
# ✅ Shows usage

# Export test
node cli/clawclawgo.mjs export ~/clawclawgo --out /tmp/test-export.json
# ✅ Generates build.json
```

## Next Steps

1. Test export on a real skills repo (with SKILL.md files)
2. Add URL fetching for scan/preview (currently stdin/file only)
3. Build the web search interface at clawclawgo.com
4. Add GitHub crawler to populate registry
5. Schema validation for registry entries (optional)

## Branch & Commit

- Branch: `feature/cli-rewrite`
- Commit: `adefede` (Rewrite CLI as agent-agnostic skills aggregator)
- PR: https://github.com/bolander72/clawclawgo/pull/new/feature/cli-rewrite
