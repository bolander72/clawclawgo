# Quick Start

Get RipperClaw running and apply your first loadout in under 5 minutes.

## Prerequisites

- [OpenClaw](https://github.com/openclaw/openclaw) installed and running
- macOS, Windows, or Linux

## 1. Install RipperClaw

Download the latest release for your platform from the [releases page](https://github.com/bolander72/ripperclaw/releases/latest).

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | `.dmg` |
| macOS (Intel) | `.dmg` |
| Windows | `.exe` installer |
| Linux | `.deb` or `.AppImage` |

## 2. Launch & Connect

Open RipperClaw. If OpenClaw's gateway is running, you'll see **LIVE** in the status bar. The app automatically detects your config at `~/.openclaw/openclaw.json`.

If you see **MOCK**, the gateway isn't reachable. RipperClaw will show sample data so you can still explore the UI.

## 3. View Your Loadout

The **Slots** view shows your current agent's configuration across all slots. Click any slot to see its details: which model you're running, what skills are installed, your integrations, etc.

## 4. Save a Snapshot

Go to **Loadouts** → **Save Current Loadout**. Give it a name like "My Setup v1". This captures your current config as a portable JSON file.

## 5. Browse the Feed

Switch to **The Feed** to see loadouts published by other users on Nostr. Find one you like? Click **Compare** to see how it differs from yours, or **Apply** to create a new agent from it.

## 6. Apply a Loadout

The Apply Wizard walks you through:
1. **Name** your new agent
2. **Review** what each slot will do (write files, install skills, etc.)
3. **Confirm** and apply

Your new agent gets its own workspace at `~/.openclaw/agents/<name>/`. Restart OpenClaw to activate it.

## Using the CLI

Prefer the terminal? The `ripperclaw` CLI does the same thing:

```bash
# Export your current agent
node ripperclaw.mjs export

# Preview what an apply would do
node ripperclaw.mjs apply loadout.json --agent my-bot --dry-run

# Apply for real
node ripperclaw.mjs apply loadout.json --agent my-bot
```

## Next Steps

- [Slots](/guide/slots): deep dive into each slot
- [Exporting](/guide/exporting): customize your exports
- [Publishing](/guide/publishing): share on Nostr
