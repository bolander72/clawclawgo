# Exporting

Export your current agent configuration as a portable loadout file.

## What Gets Exported

| Slot | Exported | Scrubbed |
|------|----------|----------|
| Model | Tiers, providers, model names | — |
| Persona | SOUL.md, IDENTITY.md, AGENTS.md | Phone numbers, emails, addresses |
| Skills | Names, versions, sources | — |
| Integrations | Types and names (no credentials) | API keys, tokens, passwords |
| Automations | HEARTBEAT.md content, cron job configs | — |
| Memory | Directory structure, template files | Actual memory content, facts, notes |

## PII Scrubbing

Exports automatically scrub personally identifiable information:

- Phone numbers → `[REDACTED_PHONE]`
- Email addresses → `[REDACTED_EMAIL]`
- Street addresses → `[REDACTED_ADDRESS]`
- API keys and tokens → removed entirely
- Absolute file paths → relativized

You can review what was scrubbed in the export report.

## Using the App

1. Go to **Loadouts** → **Save Current Loadout**
2. Name your loadout
3. The loadout is saved to your workspace's `loadouts/` directory

## Using the CLI

```bash
# Export to stdout
node ripperclaw.mjs export

# Export to file
node ripperclaw.mjs export > my-loadout.json
```

## Safe Export for Publishing

When publishing to Nostr, RipperClaw uses `export_loadout_safe` which applies stricter scrubbing and returns a report of what was redacted:

```json
{
  "scrubbed_fields": [
    "persona.soul.content: 3 phone numbers redacted",
    "persona.soul.content: 2 email addresses redacted"
  ],
  "warnings": [
    "AGENTS.md contains a GitHub username"
  ]
}
```

## Export Format

Exports use the [Loadout Schema](/reference/schema) — a JSON format with `meta`, `slots`, and `mods` sections. See the reference for the full spec.
