/**
 * Loadout Export — reads the local OpenClaw installation and builds a loadout snapshot.
 * Sanitizes secrets, API keys, and PII. Only structure and versions leave the machine.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";
import { homedir } from "node:os";
import { execSync } from "node:child_process";
import type {
  Loadout,
  Mod,
  SlotHeart,
  SlotSoul,
  SlotBrain,
  SlotOS,
  SlotMouth,
  SlotEars,
  SlotEyes,
  SlotNervousSystem,
  SlotSkeleton,
} from "./schema/loadout.js";

// ── Helpers ─────────────────────────────────────────────────────────

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path: string): Promise<any> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw);
}

async function readText(path: string): Promise<string> {
  return readFile(path, "utf-8");
}

function tokenEstimate(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.round(text.length / 4);
}

function tryExec(cmd: string): string | undefined {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 5000 }).trim();
  } catch {
    return undefined;
  }
}

// ── Config Paths ────────────────────────────────────────────────────

function resolveClawPaths() {
  const home = homedir();
  const clawDir = join(home, ".openclaw");
  return {
    clawDir,
    config: join(clawDir, "openclaw.json"),
    workspace: join(clawDir, "workspace"),
    extensions: join(clawDir, "extensions"),
  };
}

// ── Slot Extractors ─────────────────────────────────────────────────

function extractHeart(config: any): SlotHeart | undefined {
  const defaults = config?.agents?.defaults;
  const hb = defaults?.heartbeat;
  if (!hb) return undefined;

  return {
    interval: hb.every || "unknown",
    model: hb.model || "default",
    tasks: [], // Could parse HEARTBEAT.md for task names
  };
}

async function extractSoul(workspace: string): Promise<SlotSoul> {
  const soulPath = join(workspace, "SOUL.md");
  const identityPath = join(workspace, "IDENTITY.md");

  const exists = await fileExists(soulPath);
  const soul: SlotSoul = { exists };

  if (exists) {
    const text = await readText(soulPath);
    soul.tokens = tokenEstimate(text);
  }

  if (await fileExists(identityPath)) {
    const identity = await readText(identityPath);
    const nameMatch = identity.match(/\*\*Name:\*\*\s*(.+)/);
    if (nameMatch) soul.name = nameMatch[1].trim();
  }

  return soul;
}

function extractBrain(config: any): SlotBrain {
  const plugins = config?.plugins || {};
  const compaction = config?.agents?.defaults?.compaction || {};
  const contextEngine = plugins?.slots?.contextEngine || "legacy";

  // Try to get version from installs
  const installId =
    contextEngine !== "legacy" ? contextEngine : undefined;
  const installInfo = installId
    ? plugins?.installs?.[installId]
    : undefined;

  return {
    contextEngine,
    contextEngineVersion: installInfo?.version,
    compactionMode: compaction.mode,
    reserveTokensFloor: compaction.reserveTokensFloor,
    memoryPlugin: plugins?.slots?.memory,
  };
}

function extractOS(config: any): SlotOS {
  const openclawVersion =
    tryExec("openclaw --version")?.replace(/[^0-9.a-z-]/gi, "") || "unknown";

  return {
    runtime: "openclaw",
    version: openclawVersion,
    gatewayMode: config?.gateway?.mode,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}

function extractMouth(config: any): SlotMouth {
  const tts = config?.messages?.tts;
  if (!tts) return { tts: "none" };

  const provider = tts.provider || "none";
  const providerConfig = tts[provider] || {};

  return {
    tts: provider,
    voice: providerConfig.voice,
    speed: providerConfig.rate
      ? parseFloat(providerConfig.rate)
      : undefined,
    lang: providerConfig.lang,
  };
}

function extractEars(config: any): SlotEars {
  const audio = config?.tools?.media?.audio;
  if (!audio?.enabled) return { stt: "none" };

  const models = audio.models || [];
  const first = models[0];
  if (!first) return { stt: "none" };

  // Detect provider from config
  const isLocal = first.type === "cli";
  const stt = isLocal ? "local-cli" : first.type || "unknown";

  return {
    stt,
    model: first.model,
    local: isLocal,
  };
}

function extractEyes(config: any): SlotEyes {
  // Cameras would be detected from HA config, nodes, etc.
  // For now, basic detection
  return {
    cameras: [], // TODO: detect from HA entities or node capabilities
    screenCapture: false, // TODO: detect peekaboo
  };
}

function extractNervousSystem(config: any): SlotNervousSystem {
  const channels: string[] = [];
  const channelConfig = config?.channels || {};

  for (const [id, cfg] of Object.entries(channelConfig)) {
    if ((cfg as any)?.enabled !== false) {
      channels.push(id);
    }
  }

  return {
    channels,
    integrations: [], // TODO: detect HA, calendar, email from workspace analysis
  };
}

function extractSkeleton(config: any): SlotSkeleton {
  const defaults = config?.agents?.defaults || {};
  const model = defaults.model || {};
  const subagents = defaults.subagents || {};

  return {
    primaryModel: model.primary || "unknown",
    subagentModel: subagents.model?.primary,
    maxConcurrent: defaults.maxConcurrent,
    maxSubagents: subagents.maxConcurrent,
    authMode: config?.gateway?.auth?.mode,
  };
}

// ── Mod Detection ───────────────────────────────────────────────────

async function detectMods(config: any, workspace: string): Promise<Mod[]> {
  const mods: Mod[] = [];

  // Bundled skills from config
  const allowBundled = config?.skills?.allowBundled || [];
  for (const skill of allowBundled) {
    mods.push({
      name: skill,
      source: "bundled",
      enabled: true,
    });
  }

  // Workspace skills
  const skillsDir = join(workspace, "skills");
  if (await fileExists(skillsDir)) {
    try {
      const entries = await readdir(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillMd = join(skillsDir, entry.name, "SKILL.md");
          if (await fileExists(skillMd)) {
            // Don't add if already in bundled list
            if (!allowBundled.includes(entry.name)) {
              mods.push({
                name: entry.name,
                source: "custom",
                enabled: true,
              });
            }
          }
        }
      }
    } catch {
      // skills dir not readable
    }
  }

  // Plugin-installed skills
  const installs = config?.plugins?.installs || {};
  for (const [id, info] of Object.entries(installs)) {
    if (id === "bluebubbles") continue; // channel, not a mod
    const installInfo = info as any;
    mods.push({
      name: id,
      version: installInfo.version,
      source: "plugin",
      enabled: config?.plugins?.entries?.[id]?.enabled !== false,
    });
  }

  return mods;
}

// ── Main Export ──────────────────────────────────────────────────────

export interface ExportOptions {
  name?: string;
  author?: string;
  tags?: string[];
  description?: string;
}

export async function exportLoadout(
  options: ExportOptions = {}
): Promise<Loadout> {
  const paths = resolveClawPaths();

  // Read config
  let config: any = {};
  if (await fileExists(paths.config)) {
    config = await readJson(paths.config);
  }

  // Extract all slots
  const soul = await extractSoul(paths.workspace);

  const loadout: Loadout = {
    schema: 1,
    meta: {
      name: options.name || `${soul.name || "Agent"}'s Loadout`,
      author: options.author || tryExec("git config user.name") || "unknown",
      version: 1,
      exportedAt: new Date().toISOString(),
      tags: options.tags,
      description: options.description,
    },
    slots: {
      heart: extractHeart(config),
      soul,
      brain: extractBrain(config),
      os: extractOS(config),
      mouth: extractMouth(config),
      ears: extractEars(config),
      eyes: extractEyes(paths.config),
      nervousSystem: extractNervousSystem(config),
      skeleton: extractSkeleton(config),
    },
    mods: await detectMods(config, paths.workspace),
  };

  return loadout;
}
