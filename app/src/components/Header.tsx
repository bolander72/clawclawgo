export function Header() {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{ borderColor: 'var(--rc-border)', background: 'var(--rc-surface)' }}
      data-tauri-drag-region
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-wider" style={{ color: 'var(--rc-cyan)' }}>
            RIPPER
          </span>
          <span className="text-lg font-bold tracking-wider" style={{ color: 'var(--rc-magenta)' }}>
            CLAW
          </span>
        </div>
        <span className="text-xs font-mono" style={{ color: 'var(--rc-text-muted)' }}>
          v0.1.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full health-pulse"
            style={{ backgroundColor: 'var(--rc-green)' }}
          />
          <span className="text-xs" style={{ color: 'var(--rc-text-dim)' }}>
            ALL SYSTEMS NOMINAL
          </span>
        </div>
        <button
          className="px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border transition-all hover:opacity-80"
          style={{
            borderColor: 'var(--rc-border)',
            color: 'var(--rc-text-dim)',
            background: 'transparent',
          }}
        >
          Export
        </button>
      </div>
    </header>
  );
}
