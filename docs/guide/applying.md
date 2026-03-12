# Applying a Loadout

Apply a loadout to create a new agent or update an existing one.

## Safety Rules

RipperClaw follows strict safety rules when applying:

1. **Never overwrites existing agent workspaces**: if `~/.openclaw/agents/<id>/` exists, the apply is blocked
2. **Backs up config before changes**: `openclaw.json` is copied to `openclaw.backup-<timestamp>.json`
3. **Protects the default agent**: if `agents.list` is empty, automatically adds the current agent as `default: true` before creating the new one
4. **Integrations are always manual**: credentials never transfer, you get a checklist with docs links
5. **Persona requires confirmation**: SOUL.md changes are shown before applying

## Apply Modes

### Create New Agent (Default)

Creates a fresh agent workspace at `~/.openclaw/agents/<id>/`.

- Writes persona files (IDENTITY.md, SOUL.md, AGENTS.md)
- Creates USER.md template (never copies actual user data)
- Installs community skills from ClawHub
- Enables bundled skills
- Writes HEARTBEAT.md
- Creates memory directory structure with templates
- Adds agent entry to `openclaw.json`

### Update Existing Agent

Merges loadout changes into an existing agent:

- Writes/overwrites persona files (with confirmation)
- Installs missing skills (keeps existing versions)
- Overwrites HEARTBEAT.md
- Creates missing memory directories
- Updates model config

## Model Strategy

When applying, you choose how to handle models:

- **Use loadout's models**: adopts exactly what the loadout specifies
- **Use my models**: remaps loadout tiers to your existing model configuration

This is useful when a loadout uses paid models you don't have access to, or when you prefer local models.

## Using the App

1. Find a loadout (Loadouts view, Feed, or import a file)
2. Click **Apply to Agent**
3. Enter an agent ID and display name
4. Choose your model strategy
5. Review the slot-by-slot action plan
6. Confirm and apply
7. Restart OpenClaw to activate the new agent

## Using the CLI

```bash
# Preview what would happen
node ripperclaw.mjs apply loadout.json --agent my-bot --dry-run

# Apply for real
node ripperclaw.mjs apply loadout.json --agent my-bot

# Use your own models instead of the loadout's
node ripperclaw.mjs apply loadout.json --agent my-bot --use-my-models
```

## After Applying

The new agent gets its own:
- Workspace directory with all files
- Entry in `openclaw.json` under `agents.list`
- Independent model, skills, and persona config

Restart OpenClaw for the new agent to become available. Multi-agent setups let you switch between agents in the RipperClaw app's sidebar.
