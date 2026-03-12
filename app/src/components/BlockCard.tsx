import type { BlockData } from '../types';

interface Props {
  block: BlockData;
  selected: boolean;
  onClick: () => void;
}

const statusColor: Record<string, string> = {
  active: 'var(--rc-green)',
  degraded: 'var(--rc-yellow)',
  offline: 'var(--rc-red)',
  empty: 'var(--rc-text-muted)',
};

export function BlockCard({ block, selected, onClick }: Props) {
  return (
    <div
      className={`block-card ${selected ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: 'var(--rc-cyan)' }}>
            {block.icon}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--rc-text)' }}>
            {block.label}
          </span>
        </div>
        <div
          className="w-2 h-2 rounded-full health-pulse"
          style={{ backgroundColor: statusColor[block.status] }}
        />
      </div>
      <div className="text-xs" style={{ color: 'var(--rc-cyan)' }}>
        {block.component}
        {block.version && (
          <span style={{ color: 'var(--rc-text-dim)' }}> v{block.version}</span>
        )}
      </div>
    </div>
  );
}
