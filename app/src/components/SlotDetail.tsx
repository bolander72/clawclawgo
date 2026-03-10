import type { SlotData } from '../types';

interface Props {
  slot: SlotData;
}

export function SlotDetail({ slot }: Props) {
  return (
    <div
      className="h-full p-6 rounded-lg border"
      style={{
        background: 'var(--rc-surface)',
        borderColor: 'var(--rc-cyan)',
        boxShadow: '0 0 20px var(--rc-cyan-dim), inset 0 0 20px rgba(0, 240, 255, 0.03)',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl" style={{ color: 'var(--rc-cyan)' }}>
          {slot.icon}
        </span>
        <div>
          <h2
            className="text-xl font-bold uppercase tracking-wider"
            style={{ color: 'var(--rc-text)' }}
          >
            {slot.label}
          </h2>
          <p className="text-sm" style={{ color: 'var(--rc-cyan)' }}>
            {slot.component}
            {slot.version && (
              <span style={{ color: 'var(--rc-text-dim)' }}> v{slot.version}</span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'var(--rc-text-muted)' }}
        >
          Specifications
        </h3>
        {Object.entries(slot.details).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between items-center py-2 px-3 rounded"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--rc-text-dim)' }}
            >
              {key}
            </span>
            <span className="text-sm font-mono" style={{ color: 'var(--rc-text)' }}>
              {String(value)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80"
          style={{
            borderColor: 'var(--rc-cyan)',
            color: 'var(--rc-cyan)',
            background: 'transparent',
          }}
        >
          Upgrade
        </button>
        <button
          className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80"
          style={{
            borderColor: 'var(--rc-border)',
            color: 'var(--rc-text-dim)',
            background: 'transparent',
          }}
        >
          Swap
        </button>
      </div>
    </div>
  );
}
