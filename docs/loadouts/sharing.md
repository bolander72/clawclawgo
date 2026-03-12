# Sharing Loadouts

## Publish to Nostr

The primary way to share loadouts. See the [Publishing guide](/guide/publishing) for full details.

```
You → Export (safe) → Nostr relays → Anyone's Feed
```

## Share as a File

Loadouts are JSON files. Share them however you want:

- Send the `.json` file directly
- Host on a URL
- Commit to a Git repo
- Paste in Discord/Slack

The recipient can import the file in RipperClaw via drag-and-drop or the **Import File** button in the Loadouts view.

## What Gets Shared

Everything in the loadout is designed to be safe to share.

**What's included:**
- Model names and tiers
- Persona files (PII scrubbed)
- Skill names and versions
- Integration types (not credentials)
- Heartbeat tasks
- Memory directory structure

**What's excluded:**
- API keys, tokens, passwords
- Phone numbers, emails, addresses
- Actual memory content
- Chat history or conversations

## Licensing

Loadouts published to Nostr are public. There's no built-in licensing system. If you include a SOUL.md with specific personality writing, consider that anyone can read and apply it.
