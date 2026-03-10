/**
 * Terminal display for loadouts and diffs.
 */

import type { Loadout, LoadoutDiff } from "./schema/loadout.js";

// ── Colors (ANSI) ───────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
};

const SLOT_LABELS: Record<string, { icon: string; label: string }> = {
  heart: { icon: "♥", label: "Heart" },
  soul: { icon: "✦", label: "Soul" },
  brain: { icon: "◉", label: "Brain" },
  os: { icon: "⚙", label: "OS" },
  mouth: { icon: "◐", label: "Mouth" },
  ears: { icon: "◑", label: "Ears" },
  eyes: { icon: "◎", label: "Eyes" },
  nervousSystem: { icon: "⚡", label: "Nervous System" },
  skeleton: { icon: "△", label: "Skeleton" },
};

// ── Loadout Display ─────────────────────────────────────────────────

export function displayLoadout(loadout: Loadout): string {
  const lines: string[] = [];

  // Header
  lines.push("");
  lines.push(
    `${c.bold}${c.cyan}  RIPPERDOC — LOADOUT EXPORT${c.reset}`
  );
  lines.push(`${c.dim}  ${"─".repeat(50)}${c.reset}`);
  lines.push("");

  // Meta
  lines.push(`  ${c.bold}${loadout.meta.name}${c.reset}`);
  lines.push(
    `  ${c.dim}by ${loadout.meta.author} · v${loadout.meta.version} · ${loadout.meta.exportedAt.slice(0, 10)}${c.reset}`
  );
  if (loadout.meta.tags?.length) {
    lines.push(
      `  ${c.dim}tags: ${loadout.meta.tags.join(", ")}${c.reset}`
    );
  }
  if (loadout.meta.description) {
    lines.push(`  ${c.dim}${loadout.meta.description}${c.reset}`);
  }
  lines.push("");

  // Slots
  lines.push(`  ${c.bold}SLOTS${c.reset}`);
  lines.push(`  ${c.dim}${"─".repeat(50)}${c.reset}`);

  for (const [key, slot] of Object.entries(loadout.slots)) {
    if (!slot) continue;
    const info = SLOT_LABELS[key] || { icon: "?", label: key };
    lines.push("");
    lines.push(
      `  ${c.cyan}${info.icon}${c.reset} ${c.bold}${info.label}${c.reset}`
    );

    for (const [field, value] of Object.entries(slot)) {
      if (value === undefined || value === null) continue;
      const display =
        Array.isArray(value)
          ? value.length > 0
            ? value.join(", ")
            : "(none)"
          : String(value);
      lines.push(
        `    ${c.dim}${field}:${c.reset} ${display}`
      );
    }
  }

  // Mods
  lines.push("");
  lines.push(`  ${c.bold}MODS${c.reset} (${loadout.mods.length})`);
  lines.push(`  ${c.dim}${"─".repeat(50)}${c.reset}`);

  if (loadout.mods.length === 0) {
    lines.push(`  ${c.dim}(no mods installed)${c.reset}`);
  } else {
    for (const mod of loadout.mods) {
      const ver = mod.version ? `@${mod.version}` : "";
      const src = `${c.dim}[${mod.source}]${c.reset}`;
      const status =
        mod.enabled === false ? ` ${c.red}(disabled)${c.reset}` : "";
      lines.push(`    ${c.green}${mod.name}${ver}${c.reset} ${src}${status}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Diff Display ────────────────────────────────────────────────────

export function displayDiff(diff: LoadoutDiff): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(`${c.bold}${c.magenta}  RIPPERDOC — LOADOUT DIFF${c.reset}`);
  lines.push(`${c.dim}  ${"─".repeat(50)}${c.reset}`);

  if (
    diff.slotDiffs.length === 0 &&
    diff.modsOnlyYours.length === 0 &&
    diff.modsOnlyTheirs.length === 0 &&
    diff.modVersionDiffs.length === 0
  ) {
    lines.push("");
    lines.push(`  ${c.green}Identical loadouts.${c.reset}`);
    lines.push("");
    return lines.join("\n");
  }

  // Slot diffs
  for (const slotDiff of diff.slotDiffs) {
    const info =
      SLOT_LABELS[slotDiff.slot] || { icon: "?", label: slotDiff.slot };
    lines.push("");
    lines.push(
      `  ${c.cyan}${info.icon}${c.reset} ${c.bold}${info.label}${c.reset}`
    );

    for (const change of slotDiff.changes) {
      const y =
        change.yours === undefined
          ? `${c.dim}(none)${c.reset}`
          : String(change.yours);
      const t =
        change.theirs === undefined
          ? `${c.dim}(none)${c.reset}`
          : String(change.theirs);
      lines.push(`    ${change.field}:`);
      lines.push(`      ${c.red}- yours: ${y}${c.reset}`);
      lines.push(`      ${c.green}+ theirs: ${t}${c.reset}`);
    }
  }

  // Mod diffs
  if (diff.modsOnlyYours.length > 0) {
    lines.push("");
    lines.push(`  ${c.bold}Mods only in yours:${c.reset}`);
    for (const name of diff.modsOnlyYours) {
      lines.push(`    ${c.red}- ${name}${c.reset}`);
    }
  }

  if (diff.modsOnlyTheirs.length > 0) {
    lines.push("");
    lines.push(`  ${c.bold}Mods only in theirs:${c.reset}`);
    for (const name of diff.modsOnlyTheirs) {
      lines.push(`    ${c.green}+ ${name}${c.reset}`);
    }
  }

  if (diff.modVersionDiffs.length > 0) {
    lines.push("");
    lines.push(`  ${c.bold}Mod version differences:${c.reset}`);
    for (const d of diff.modVersionDiffs) {
      lines.push(
        `    ${c.yellow}~ ${d.name}: ${d.yours || "?"} → ${d.theirs || "?"}${c.reset}`
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}
