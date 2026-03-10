export interface SlotData {
  id: string;
  label: string;
  icon: string;
  status: 'active' | 'degraded' | 'offline' | 'empty';
  component: string;
  version?: string;
  details: Record<string, string | number | boolean>;
}

export interface Loadout {
  schema: number;
  meta: {
    name: string;
    author: string;
    version: number;
    exportedAt: string;
  };
  slots: Record<string, unknown>;
  mods: Mod[];
}

export interface Mod {
  name: string;
  source: 'bundled' | 'custom' | 'plugin' | 'community';
  enabled: boolean;
  version?: string;
  description?: string;
}
