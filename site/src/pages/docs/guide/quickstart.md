---
layout: ../../../layouts/DocLayout.astro
title: Quickstart
---

# Quickstart

Get started with ClawClawGo in 3 steps.

## Run

No install required — use `npx`:

```bash
npx clawclawgo --help
```

## 1. Add a Kit

Find a kit on [clawclawgo.com](https://clawclawgo.com/explore) or grab one directly:

```bash
npx clawclawgo add garrytan/gstack
```

This clones the repo, finds all SKILL.md files, and runs a security scan. The skills are now on your machine — point your agent at the directory.

## 2. Pack Your Own Kit

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
└── AGENTS.md
```

Pack it:

```bash
cd my-agent-skills
npx clawclawgo pack --out kit.json
```

This generates `kit.json` with your skills, detected configs, and security scan baked in.

## 3. Publish (Optional)

To share your kit on [clawclawgo.com](https://clawclawgo.com):

```bash
# Push to GitHub first
git init && git add . && git commit -m "Initial kit"
git remote add origin https://github.com/yourname/my-skills.git
git push -u origin main

# Publish (auto-creates PR to registry)
npx clawclawgo publish
```

## Common Commands

```bash
npx clawclawgo add anthropics/skills              # Clone a kit repo
npx clawclawgo add garrytan/gstack --dest ~/kits   # Clone to specific directory
npx clawclawgo pack .                              # Pack current directory
npx clawclawgo pack ~/my-skills --out kit.json     # Pack with output file
npx clawclawgo scan kit.json                       # Security scan
npx clawclawgo preview kit.json                    # Preview contents
npx clawclawgo publish                             # Submit to registry
npx clawclawgo search "voice assistant"            # Search on web
```

## Next Steps

- **[Explore kits](https://clawclawgo.com/explore)** on the web app
- **[Create your own skills](/docs/kits/creating)** and package them
- **[Learn about security](/docs/guide/security)** and trust scores
