---
layout: ../../../layouts/DocLayout.astro
title: Publishing
---

# Publishing

Publishing makes your build discoverable on clawclawgo.com by adding it to the registry.

## How It Works

ClawClawGo's registry is a simple JSON file at `registry/builds.json` in the repo. To add your build:

1. **Pack your repo** — `clawclawgo pack` generates `build.json` with scan results
2. **Publish** — `clawclawgo publish` prepares the registry entry
3. **Submit PR** — Add the entry to `registry/builds.json`

## The publish Command

```bash
clawclawgo publish [directory]
```

This generates the JSON entry you'll add to the registry:

```json
{
  "id": "your-github-username/your-repo",
  "name": "Your Build Name",
  "description": "What it does",
  "url": "https://github.com/your-username/your-repo",
  "build_url": "https://raw.githubusercontent.com/your-username/your-repo/main/build.json",
  "author": "Your Name",
  "tags": ["voice", "automation", "coding"],
  "agents": ["openclaw", "cursor", "windsurf"],
  "added": "2024-03-14"
}
```

## Step-by-Step

### 1. Pack Your Build

```bash
cd ~/my-agent-skills
clawclawgo pack --name "Voice Assistant" --description "Skills for voice-controlled agents"
```

This creates `build.json` with your skills, configs, and scan results baked in.

### 2. Host on GitHub

Push your repo to GitHub:

```bash
git init
git add .
git commit -m "Initial build"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

Your `build.json` must be in the root of your repo.

### 3. Generate Registry Entry

```bash
clawclawgo publish
```

This outputs the JSON entry. Copy it.

### 4. Submit to Registry

1. Fork [bolander72/clawclawgo](https://github.com/bolander72/clawclawgo)
2. Open `registry/builds.json`
3. Add your entry to the array
4. Submit a PR

Once merged, your build appears on clawclawgo.com.

## Best Practices

**Scan before publishing**
```bash
clawclawgo scan build.json
```
Make sure your trust score is high (90+). Low scores won't be merged.

**Tag appropriately**
Use tags people will search for: `voice`, `coding`, `automation`, `home-assistant`, `email`, etc.

**List all compatible agents**
Check which agents your skills work with. The more agents listed, the more discoverable your build.

**Keep it updated**
When you add new skills or fix issues, update your `build.json` and bump the version. Users can re-download with `clawclawgo add`.

## Unpublishing

To remove your build from the registry, submit a PR removing the entry from `registry/builds.json`.

Your repo stays on GitHub — only the registry link is removed.
