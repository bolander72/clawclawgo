# RipperClaw

Cyberware manager for AI agents. Export, compare, and share your agent's loadout.

## What is it?

RipperClaw maps your AI agent's configuration to a cyberpunk-inspired "cyberware" metaphor. Every component of your agent — its model, memory, skills, voice, tools — maps to a body slot. Your full setup is your **loadout**.

### Slots

| Slot | Maps To |
|---|---|
| Heart | Heartbeat tasks, health checks |
| Soul | Personality (SOUL.md, IDENTITY.md) |
| Brain | Context engine, memory, LCM |
| OS | Base agent runtime (OpenClaw) |
| Mouth | TTS, voice output |
| Ears | STT, voice input |
| Eyes | Vision, cameras, screenshots |
| Nervous System | Crons, reminders, automations |
| Skeleton | Model router, provider config |

### The Feed

Share your rig on Nostr (kind 38333 events). Browse what others are running. Compare any loadout against yours.

- **Offline**: Export/import `.loadout.json` files
- **Connected**: Publish to relays, browse the Feed
- **Self-hosted**: Run your own relay as an OpenClaw plugin

## Desktop App (Tauri v2)

```bash
cd app
npm install
npm run tauri dev
```

Built with React + Tailwind + Rust. Cyberpunk dark theme.

### Features

- Live slot visualization from your OpenClaw config
- PII scrubber strips 12 pattern types before publishing
- Nostr integration (key management, publish, subscribe)
- Compare view: diff any loadout against yours
- Publish flow with scrub review step

## CLI

```bash
npm install
npm run build

# Export your loadout
npx ripperclaw export

# Diff against another loadout
npx ripperclaw diff other.loadout.json

# Inspect a loadout file
npx ripperclaw inspect loadout.json
```

## Templates

| Template | Style |
|---|---|
| Homelab | Self-hosted, privacy-first |
| Ops | Lean productivity |
| Researcher | Deep analysis |
| Smart Home | Automation-focused |
| Creator | Content & social |

## Privacy

The PII scrubber runs before any loadout is published:

- Phone numbers, emails, SSNs
- IP addresses (private + public)
- Home directory paths
- API keys, bearer tokens, nostr secret keys
- Street addresses, MAC addresses
- Hex private keys (64-char)
- Sensitive config fields (channels, agent names, HA config)

You review the scrubbed output before it goes live.

## Architecture

```
ripperclaw/
  src/           # CLI (TypeScript)
  app/           # Desktop app (Tauri v2 + React)
    src/         # React frontend
    src-tauri/   # Rust backend
      src/
        lib.rs   # OpenClaw data reading
        nostr.rs # Nostr protocol
        scrub.rs # PII scrubber
  PLAN.md        # Full roadmap
```

## Roadmap

- [x] Phase 0: CLI export/diff/inspect
- [x] Phase 1: Tauri desktop app
- [x] Phase 2: Live OpenClaw data
- [x] Phase 3a: Feed + compare views
- [x] Phase 3b: Nostr + PII scrubber + publish flow
- [ ] Phase 3c: Self-hosted relay (OpenClaw plugin)
- [ ] Phase 4: Bitcoin ordinals anchoring

## License

MIT
