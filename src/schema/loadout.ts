/**
 * Ripperdoc Loadout Schema
 *
 * A loadout is a portable, shareable snapshot of an AI agent's full configuration.
 * Each slot maps to a real subsystem with real versions and real upgrade paths.
 */

// ── Slot Types ──────────────────────────────────────────────────────

export interface SlotHeart {
  /** Heartbeat cron interval (e.g. "1h", "30m") */
  interval: string;
  /** Model used for heartbeat checks */
  model: string;
  /** Number of active cron jobs */
  cronJobs?: number;
  /** Custom heartbeat tasks summary */
  tasks?: string[];
}

export interface SlotSoul {
  /** Whether SOUL.md exists and is populated */
  exists: boolean;
  /** Approximate token count of SOUL.md */
  tokens?: number;
  /** Agent name from IDENTITY.md */
  name?: string;
  /** Key personality traits / anti-patterns defined */
  traits?: string[];
}

export interface SlotBrain {
  /** Context engine in use ("legacy" | "lossless-claw" | other) */
  contextEngine: string;
  /** Context engine version if plugin-based */
  contextEngineVersion?: string;
  /** Compaction mode */
  compactionMode?: string;
  /** Memory layout files present */
  memoryFiles?: string[];
  /** Memory plugin id */
  memoryPlugin?: string;
  /** Reserve tokens floor */
  reserveTokensFloor?: number;
}

export interface SlotOS {
  /** Runtime platform ("openclaw" for now) */
  runtime: string;
  /** Runtime version */
  version: string;
  /** Gateway mode */
  gatewayMode?: string;
  /** Node.js version */
  nodeVersion?: string;
  /** OS platform */
  platform?: string;
  /** Architecture */
  arch?: string;
}

export interface SlotMouth {
  /** TTS provider ("kokoro-onnx" | "edge" | "openai" | "elevenlabs" | "mac" | "none") */
  tts: string;
  /** Voice name/id */
  voice?: string;
  /** Speed multiplier */
  speed?: number;
  /** Language */
  lang?: string;
}

export interface SlotEars {
  /** STT provider ("whisper-local" | "openai-api" | "mlx-stt" | "none") */
  stt: string;
  /** Model name */
  model?: string;
  /** Local or remote */
  local?: boolean;
}

export interface SlotEyes {
  /** Camera integrations */
  cameras?: string[];
  /** Screen capture available */
  screenCapture?: boolean;
  /** Image analysis model */
  imageModel?: string;
}

export interface SlotNervousSystem {
  /** Active channels */
  channels: string[];
  /** Active integrations (home assistant, calendar, etc.) */
  integrations?: string[];
  /** Webhook count */
  webhookCount?: number;
  /** Node connections */
  nodes?: string[];
}

export interface SlotSkeleton {
  /** Primary model */
  primaryModel: string;
  /** Sub-agent model */
  subagentModel?: string;
  /** Local model */
  localModel?: string;
  /** Max concurrent agents */
  maxConcurrent?: number;
  /** Max concurrent sub-agents */
  maxSubagents?: number;
  /** Auth mode */
  authMode?: string;
}

export interface Mod {
  /** Skill/mod name */
  name: string;
  /** Version */
  version?: string;
  /** Source ("clawhub" | "bundled" | "custom" | "marketplace") */
  source: string;
  /** Whether it's currently enabled */
  enabled?: boolean;
  /** Brief description */
  description?: string;
}

// ── Loadout ─────────────────────────────────────────────────────────

export interface Loadout {
  /** Schema version for forward compatibility */
  schema: 1;

  /** Loadout metadata */
  meta: {
    /** Display name */
    name: string;
    /** Author identifier */
    author: string;
    /** Loadout version (increments on export) */
    version: number;
    /** Template this was based on, if any */
    template?: string;
    /** ISO timestamp of export */
    exportedAt: string;
    /** Tags for discovery */
    tags?: string[];
    /** Freeform description */
    description?: string;
    /** SHA-256 hash of the loadout content (minus this field) */
    hash?: string;
  };

  /** Slots — each maps to a real agent subsystem */
  slots: {
    heart?: SlotHeart;
    soul?: SlotSoul;
    brain?: SlotBrain;
    os?: SlotOS;
    mouth?: SlotMouth;
    ears?: SlotEars;
    eyes?: SlotEyes;
    nervousSystem?: SlotNervousSystem;
    skeleton?: SlotSkeleton;
  };

  /** Installed mods (skills, automations, custom tools) */
  mods: Mod[];
}

// ── Diff ────────────────────────────────────────────────────────────

export type SlotName = keyof Loadout["slots"];

export interface SlotDiff {
  slot: SlotName | "mods";
  changes: {
    field: string;
    yours: unknown;
    theirs: unknown;
  }[];
}

export interface LoadoutDiff {
  /** Slots that differ */
  slotDiffs: SlotDiff[];
  /** Mods only in your loadout */
  modsOnlyYours: string[];
  /** Mods only in theirs */
  modsOnlyTheirs: string[];
  /** Mods in both but different versions */
  modVersionDiffs: { name: string; yours?: string; theirs?: string }[];
}
