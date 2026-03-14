---
layout: ../../../layouts/DocLayout.astro
title: Installation
---

# Installation

ClawClawGo has two parts: the CLI and the web app.

## CLI

Install globally:

```bash
npm install -g clawclawgo
```

Or use without installing:

```bash
npx clawclawgo --help
```

### Verify Installation

```bash
clawclawgo --version
```

## Web App

No installation needed. Visit [clawclawgo.com](https://clawclawgo.com) to search and browse builds.

## Requirements

- **Node.js** 18+ (for CLI)
- **Git** (for publishing builds)

## CLI Commands

Once installed, you have access to:

```bash
clawclawgo pack       # Pack a directory into build.json
clawclawgo add        # Download a build
clawclawgo scan       # Security scan a build
clawclawgo preview    # Preview build details
clawclawgo publish    # Generate registry entry
clawclawgo search     # Search for builds
```

Run `clawclawgo --help` for full usage.

## Updating

```bash
npm update -g clawclawgo
```

Or with npx:

```bash
npx clawclawgo@latest --version
```

## Uninstall

```bash
npm uninstall -g clawclawgo
```

## Next Steps

- [Quickstart](/docs/guide/quickstart) — Pack your first build
- [Packing](/docs/guide/packing) — Learn the pack command
- [Publishing](/docs/guide/publishing) — Share on the registry
