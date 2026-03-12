# Loadouts Overview

A **loadout** is a portable snapshot of an AI agent's configuration. It captures everything about how an agent is set up — which models it uses, its personality, installed skills, connected services, scheduled tasks, and memory structure.

## What's in a Loadout?

```
┌──────────────────────────────┐
│         LOADOUT              │
├──────────────────────────────┤
│  Meta                        │
│  ├─ name, author, version    │
│  ├─ tags, description        │
│  └─ exportedAt               │
│                              │
│  Slots                       │
│  ├─ Model (LLM tiers)       │
│  ├─ Persona (identity)      │
│  ├─ Skills (packages)       │
│  ├─ Integrations (services) │
│  ├─ Automations (cron)      │
│  └─ Memory (structure)      │
└──────────────────────────────┘
```

## Lifecycle

```
Export → Save → (optional) Publish → Browse → Apply
```

1. **Export** your current agent config → produces a loadout JSON file
2. **Save** it locally for versioning or backup
3. **Publish** to Nostr for others to discover
4. **Browse** the feed for loadouts shared by others
5. **Apply** a loadout to create a new agent or update an existing one

## Key Principles

### Portable
Loadouts are plain JSON. Copy them, email them, paste them, host them — they work anywhere.

### Private by Default
Exports automatically scrub phone numbers, emails, API keys, and personal data. You review what gets shared.

### Non-Destructive
Applying a loadout never deletes existing config. It creates new agents in isolated workspaces or merges changes with explicit confirmation.

### Modular
Each of the 6 slots is independent. You can apply just the skills from one loadout and the persona from another.
