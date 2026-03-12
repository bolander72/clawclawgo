import type { SkillItem } from '../types';

interface Props {
  skills: (SkillItem & { enabled?: boolean })[];
}

const sourceColor: Record<string, string> = {
  bundled: 'var(--rc-text-muted)',
  custom: 'var(--rc-cyan)',
  clawhub: 'var(--rc-magenta)',
  local: 'var(--rc-yellow)',
};

const sourceBadge: Record<string, string> = {
  bundled: 'STK',
  custom: 'CUS',
  clawhub: 'HUB',
  local: 'LOC',
};

export function SkillList({ skills }: Props) {
  const grouped = {
    clawhub: skills.filter((s) => s.source === 'clawhub'),
    custom: skills.filter((s) => s.source === 'custom'),
    bundled: skills.filter((s) => s.source === 'bundled'),
    local: skills.filter((s) => s.source === 'local'),
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
            {items.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center justify-between py-1.5 px-3 rounded text-xs"
                style={{ background: 'var(--rc-overlay-subtle)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: skill.enabled !== false ? 'var(--rc-green)' : 'var(--rc-red)',
                    }}
                  />
                  <span style={{ color: 'var(--rc-text)' }}>{skill.name}</span>
                  {skill.version && (
                    <span style={{ color: 'var(--rc-text-muted)' }}>v{skill.version}</span>
                  )}
                </div>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    color: sourceColor[skill.source],
                    border: `1px solid ${sourceColor[skill.source]}33`,
                  }}
                >
                  {sourceBadge[skill.source]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
