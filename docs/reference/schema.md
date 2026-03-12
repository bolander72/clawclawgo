# Loadout Schema

The loadout format is a JSON document with three top-level sections.

## Structure

```json
{
  "schema": 1,
  "meta": { ... },
  "slots": { ... },
  "mods": [ ... ]
}
```

## Meta

```json
{
  "name": "Quinn",
  "author": "bolander72",
  "version": 1,
  "exportedAt": "2026-03-11T22:00:00.000Z",
  "description": "Full-featured personal assistant",
  "tags": ["personal", "voice", "smart-home"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Human-readable loadout name |
| `author` | string | no | Author identifier |
| `version` | number | no | Loadout version (bump on significant changes) |
| `exportedAt` | string | yes | ISO 8601 timestamp |
| `description` | string | no | Short description |
| `tags` | string[] | no | Categorization tags |

## Slots

### `model`

```json
{
  "tiers": {
    "main": {
      "provider": "anthropic",
      "model": "claude-opus-4-6",
      "paid": true
    },
    "fast": {
      "provider": "anthropic",
      "model": "claude-sonnet-4-5",
      "paid": true
    },
    "free": {
      "provider": "ollama",
      "model": "qwen3.5:4b",
      "paid": false
    }
  }
}
```

### `persona`

```json
{
  "identity": {
    "name": "Quinn",
    "creature": "AI assistant",
    "vibe": "Calm, efficient, resourceful"
  },
  "soul": {
    "included": true,
    "content": "# SOUL.md\n\n..."
  },
  "agents": {
    "included": true,
    "content": "# AGENTS.md\n\n..."
  },
  "user": {
    "included": false,
    "template": true
  }
}
```

### `skills`

```json
{
  "items": [
    {
      "name": "weather",
      "version": "1.0.0",
      "source": "bundled",
      "requiresConfig": false
    },
    {
      "name": "frontend-design-ultimate",
      "version": "1.2.0",
      "source": "clawhub",
      "requiresConfig": false
    }
  ]
}
```

### `integrations`

```json
{
  "items": [
    {
      "type": "imessage",
      "name": "iMessage via BlueBubbles",
      "setupDocs": "https://docs.openclaw.ai/channels/bluebubbles",
      "manual": true
    }
  ]
}
```

::: warning
Integration entries are informational only. They describe what the source agent had configured. They never include credentials or connection details.
:::

### `automations`

```json
{
  "heartbeat": {
    "included": true,
    "content": "# HEARTBEAT.md\n\n## Periodic Checks\n- ..."
  },
  "cronJobs": [
    {
      "name": "Daily Health Check",
      "schedule": { "kind": "cron", "expr": "0 8 * * *" },
      "dependsOn": []
    }
  ]
}
```

### `memory`

```json
{
  "engine": "lossless-claw",
  "structure": {
    "directories": ["memory/", "memory/reference/", "memory/research/"],
    "templateFiles": [
      {
        "path": "memory/handoff.md",
        "content": "# Handoff\n\n..."
      }
    ]
  }
}
```

## Mods (Legacy)

The `mods` array is a flat list of skills for backward compatibility with schema version 1:

```json
{
  "mods": [
    { "name": "weather", "source": "bundled", "enabled": true },
    { "name": "humanize", "source": "custom", "enabled": true }
  ]
}
```

New exports use `slots.skills.items` instead.

## Validation

The formal JSON Schema is at [`specs/loadout-v2.schema.json`](https://github.com/bolander72/ripperclaw/blob/main/specs/loadout-v2.schema.json) in the repo.
