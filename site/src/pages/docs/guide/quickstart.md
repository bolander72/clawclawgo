---
layout: ../../../layouts/DocLayout.astro
title: Quickstart
---

# Quickstart

Get started with ClawClawGo in 3 steps: pack, publish, add.

## Install

```bash
npm install -g clawclawgo
```

Or use without installing:

```bash
npx clawclawgo --help
```

## 1. Pack a Build

Create a directory with your agent skills and configs:

```
my-agent-skills/
├── skills/
│   ├── voice-assistant/
│   │   └── SKILL.md
│   └── home-automation/
│       └── SKILL.md
├── .cursorrules
├── CLAUDE.md
└── openclaw.json
```

Pack it:

```bash
cd my-agent-skills
clawclawgo pack --name "My Skills" --description "Voice and home automation"
```

This creates `build.json` with your skills, configs, and security scan baked in.

## 2. Publish (Optional)

To share your build on clawclawgo.com:

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial build"
git remote add origin https://github.com/yourusername/my-skills.git
git push -u origin main

# Generate registry entry
clawclawgo publish
```

Copy the output and submit a PR to `registry/builds.json` at [github.com/bolander72/clawclawgo](https://github.com/bolander72/clawclawgo).

## 3. Add a Build

Download someone else's build:

```bash
clawclawgo add https://example.com/build.json
```

Or search and add from the registry:

```bash
clawclawgo search "voice assistant"
clawclawgo add voice-assistant-build
```

The build is downloaded to `~/.clawclawgo/builds/` (or wherever you specify with `--dest`).

## What's in a Build?

A build is a collection of:
- **Skills** — SKILL.md files following the [Agent Skills](https://agentskills.io) standard
- **Agent configs** — `.cursorrules`, `CLAUDE.md`, `openclaw.json`, etc.
- **Scan results** — Trust score and security findings

## Next Steps

- **[Search builds](https://clawclawgo.com/search)** on the web app
- **[Browse the registry](https://github.com/bolander72/clawclawgo/blob/main/registry/builds.json)**
- **[Create your own skills](/docs/builds/creating)** and package them
- **[Learn about security](/docs/guide/security)** and trust scores

## Example Workflow

**For build creators:**
1. Organize your skills and configs in a directory
2. `clawclawgo pack` to generate build.json
3. `clawclawgo scan build.json` to check security
4. Push to GitHub
5. `clawclawgo publish` and submit registry PR

**For build users:**
1. Search on [clawclawgo.com](https://clawclawgo.com)
2. `clawclawgo add <url>` to download
3. Review the scan results
4. Use the skills in your agent

## Common Commands

```bash
# Pack current directory
clawclawgo pack

# Scan a build
clawclawgo scan build.json

# Preview build details
clawclawgo preview build.json

# Search for builds
clawclawgo search "coding agent"

# Add a build
clawclawgo add https://example.com/build.json
```

That's it. Pack, publish, add.
