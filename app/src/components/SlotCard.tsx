import type { SlotData } from '../types';

interface Props {
  slot: SlotData;
  selected: boolean;
  onClick: () => void;
}

const statusColor: Record<string, string> = {
  active: 'var(--rc-green)',
  degraded: 'var(--rc-yellow)',
  offline: 'var(--rc-red)',
  empty: 'var(--rc-text-muted)',
};

export function SlotCard({ slot, selected, onClick }: Props) {
  return (
    <div
      className={`slot-card ${selected ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: 'var(--rc-cyan)' }}>
            {slot.icon}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--rc-text)' }}>
            {slot.label}
          </span>
        </div>
        <div
          className="w-2 h-2 rounded-full health-pulse"
          style={{ backgroundColor: statusColor[slot.status] }}
        />
      </div>
      <div className="text-xs" style={{ color: 'var(--rc-cyan)' }}>
        {slot.component}
        {slot.version && (
          <span style={{ color: 'var(--rc-text-dim)' }}> v{slot.version}</span>
        )}
      </div>
    </div>
  );
}
