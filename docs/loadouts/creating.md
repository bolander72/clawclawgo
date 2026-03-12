# Creating a Loadout

## From the App

1. Open RipperClaw
2. Navigate to **Loadouts** in the sidebar
3. Click **Save Current Loadout**
4. Enter a name (e.g., "Production Setup", "Lean Ops", "Dev Mode")
5. Your loadout is saved to `~/.openclaw/workspace/loadouts/`

## From the CLI

```bash
# Export to stdout (pipe-friendly)
node ripperclaw.mjs export

# Save to a specific file
node ripperclaw.mjs export > my-agent.loadout.json
```

## From the Feed

When you find a loadout in the Feed that you like, it's automatically available to save, compare, or apply. There's no separate "download" step.

## Tips

- **Save before big changes.** Create a loadout before swapping models, rewriting your SOUL.md, or installing experimental skills.
- **Name meaningfully.** "Quinn v3 — Sonnet main, no voice" is better than "backup2".
- **Version your loadouts.** The meta includes a version number. Bump it when you make significant changes before re-publishing.
