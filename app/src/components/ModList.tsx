import type { Mod } from '../types';

interface Props {
  mods: Mod[];
}

const sourceColor: Record<string, string> = {
  bundled: 'var(--rc-text-muted)',
  custom: 'var(--rc-cyan)',
  plugin: 'var(--rc-magenta)',
  community: 'var(--rc-yellow)',
};

const sourceBadge: Record<string, string> = {
  bundled: 'STK',
  custom: 'CUS',
  plugin: 'PLG',
  community: 'COM',
};

export function ModList({ mods }: Props) {
  const grouped = {
    plugin: mods.filter((m) => m.source === 'plugin'),
    custom: mods.filter((m) => m.source === 'custom'),
    bundled: mods.filter((m) => m.source === 'bundled'),
    community: mods.filter((m) => m.source === 'community'),
  };

  const sections = Object.entries(grouped).filter(([, items]) => items.length > 0);

  return (
    <div className="space-y-4">
      {sections.map(([source, items]) => (
        <div key={source}>
          <h4
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: sourceColor[source] }}
          >
            {source} ({items.length})
          </h4>
          <div className="space-y-1">
            {items.map((mod) => (
              <div
                key={mod.name}
                className="flex items-center justify-between py-1.5 px-3 rounded text-xs"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: mod.enabled ? 'var(--rc-green)' : 'var(--rc-red)',
                    }}
                  />
                  <span style={{ color: 'var(--rc-text)' }}>{mod.name}</span>
                  {mod.version && (
                    <span style={{ color: 'var(--rc-text-muted)' }}>v{mod.version}</span>
                  )}
                </div>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    color: sourceColor[mod.source],
                    border: `1px solid ${sourceColor[mod.source]}33`,
                  }}
                >
                  {sourceBadge[mod.source]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
