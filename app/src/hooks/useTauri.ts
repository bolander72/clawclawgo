import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import type { SlotData, Mod } from '../types';

function useTauriCommand<T>(
  command: string,
  fallback: T,
  args?: Record<string, unknown>,
  deps: unknown[] = []
): {
  data: T;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    invoke<T>(command, args)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        console.error(`[${command}]`, err);
        setError(String(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, deps);

  return { data, loading, error, refresh: load };
}

export function useSlots(agentId?: string) {
  return useTauriCommand<SlotData[]>(
    'get_slots',
    [],
    agentId ? { agentId } : undefined,
    [agentId]
  );
}

export interface AgentInfo {
  id: string;
  name: string | null;
  is_default: boolean;
  workspace: string | null;
  model: string | null;
  skill_count: number | null;
}

export function useAgents() {
  return useTauriCommand<AgentInfo[]>('get_agents', []);
}

export function useSkills() {
  const result = useTauriCommand<Array<{ name: string; source: string; description?: string; path: string }>>(
    'get_skills',
    []
  );

  const mods: Mod[] = result.data.map((s) => ({
    name: s.name,
    source: s.source as Mod['source'],
    enabled: true,
    description: s.description,
  }));

  return { ...result, data: mods };
}

export function useSystemStatus() {
  return useTauriCommand<{
    gateway: string;
    version?: string;
    uptime?: string;
    model?: string;
    os: string;
    arch: string;
  }>('get_system_status', { gateway: 'unknown', os: '', arch: '' });
}

export function useCronJobs() {
  return useTauriCommand<Array<{
    id: string;
    name?: string;
    enabled: boolean;
    state: Record<string, unknown>;
    schedule: Record<string, unknown>;
  }>>('get_cron_jobs', []);
}

export function useConfig() {
  return useTauriCommand<Record<string, unknown>>('get_config', {});
}

export function useExportLoadout() {
  const [loading, setLoading] = useState(false);

  const exportLoadout = async () => {
    setLoading(true);
    try {
      const loadout = await invoke('export_loadout');
      return loadout;
    } catch (err) {
      console.error('Export failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { exportLoadout, loading };
}

export function useCloneLoadout() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    applied_skills: string[];
    skipped_skills: string[];
    slot_changes: string[];
    backup_path?: string;
  } | null>(null);

  const cloneLoadout = async (loadoutJson: string, mode: 'overwrite' | 'new') => {
    setLoading(true);
    try {
      const res = await invoke<typeof result>('clone_loadout', {
        loadoutJson,
        mode,
      });
      setResult(res);
      return res;
    } catch (err) {
      console.error('Clone failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { cloneLoadout, loading, result };
}

export function useLoadouts() {
  return useTauriCommand<Array<{
    filename: string;
    name: string;
    exportedAt: string;
    path: string;
    slots: number;
    mods: number;
  }>>('list_loadouts', []);
}
