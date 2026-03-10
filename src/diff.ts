/**
 * Loadout Diff — compare two loadouts slot by slot.
 */

import type {
  Loadout,
  LoadoutDiff,
  SlotDiff,
  SlotName,
} from "./schema/loadout.js";

const SLOT_NAMES: SlotName[] = [
  "heart",
  "soul",
  "brain",
  "os",
  "mouth",
  "ears",
  "eyes",
  "nervousSystem",
  "skeleton",
];

function diffObjects(
  a: Record<string, unknown> | undefined,
  b: Record<string, unknown> | undefined
): { field: string; yours: unknown; theirs: unknown }[] {
  const changes: { field: string; yours: unknown; theirs: unknown }[] = [];
  const allKeys = new Set([
    ...Object.keys(a || {}),
    ...Object.keys(b || {}),
  ]);

  for (const key of allKeys) {
    const va = (a || {})[key];
    const vb = (b || {})[key];
    if (JSON.stringify(va) !== JSON.stringify(vb)) {
      changes.push({ field: key, yours: va, theirs: vb });
    }
  }

  return changes;
}

export function diffLoadouts(yours: Loadout, theirs: Loadout): LoadoutDiff {
  const slotDiffs: SlotDiff[] = [];

  for (const slot of SLOT_NAMES) {
    const a = yours.slots[slot] as Record<string, unknown> | undefined;
    const b = theirs.slots[slot] as Record<string, unknown> | undefined;

    // If both undefined, skip
    if (!a && !b) continue;

    const changes = diffObjects(a, b);
    if (changes.length > 0) {
      slotDiffs.push({ slot, changes });
    }
  }

  // Mod diffs
  const yourMods = new Map(yours.mods.map((m) => [m.name, m]));
  const theirMods = new Map(theirs.mods.map((m) => [m.name, m]));

  const modsOnlyYours: string[] = [];
  const modsOnlyTheirs: string[] = [];
  const modVersionDiffs: { name: string; yours?: string; theirs?: string }[] =
    [];

  for (const [name, mod] of yourMods) {
    if (!theirMods.has(name)) {
      modsOnlyYours.push(name);
    } else {
      const theirMod = theirMods.get(name)!;
      if (mod.version !== theirMod.version) {
        modVersionDiffs.push({
          name,
          yours: mod.version,
          theirs: theirMod.version,
        });
      }
    }
  }

  for (const name of theirMods.keys()) {
    if (!yourMods.has(name)) {
      modsOnlyTheirs.push(name);
    }
  }

  return { slotDiffs, modsOnlyYours, modsOnlyTheirs, modVersionDiffs };
}
