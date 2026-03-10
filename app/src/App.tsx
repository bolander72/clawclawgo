import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SlotCard } from './components/SlotCard';
import { SlotDetail } from './components/SlotDetail';
import { ModList } from './components/ModList';
import { useSlots, useSkills, useSystemStatus } from './hooks/useTauri';
import { slots as mockSlots, mods as mockMods } from './data/mockLoadout';

type View = 'rig' | 'mods';

function App() {
  const [selectedSlot, setSelectedSlot] = useState('soul');
  const [view, setView] = useState<View>('rig');

  // Try real data, fall back to mock
  const { data: realSlots, loading: slotsLoading, error: slotsError } = useSlots();
  const { data: realMods, loading: modsLoading } = useSkills();
  const { data: status } = useSystemStatus();

  const slots = realSlots.length > 0 ? realSlots : mockSlots;
  const mods = realMods.length > 0 ? realMods : mockMods;

  const activeSlot = slots.find((s) => s.id === selectedSlot) ?? slots[0];

  // Select first slot on load
  useEffect(() => {
    if (slots.length > 0 && !slots.find((s) => s.id === selectedSlot)) {
      setSelectedSlot(slots[0].id);
    }
  }, [slots]);

  const dataSource = slotsError ? 'mock' : 'live';

  return (
    <div className="h-screen flex flex-col scanlines">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar nav */}
        <nav
          className="w-14 flex flex-col items-center py-4 gap-3 border-r"
          style={{ borderColor: 'var(--rc-border)', background: 'var(--rc-surface)' }}
        >
          <button
            onClick={() => setView('rig')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
            style={{
              background: view === 'rig' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
              color: view === 'rig' ? 'var(--rc-cyan)' : 'var(--rc-text-muted)',
              border: view === 'rig' ? '1px solid var(--rc-cyan)' : '1px solid transparent',
            }}
            title="Your Rig"
          >
            ⬡
          </button>
          <button
            onClick={() => setView('mods')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
            style={{
              background: view === 'mods' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
              color: view === 'mods' ? 'var(--rc-cyan)' : 'var(--rc-text-muted)',
              border: view === 'mods' ? '1px solid var(--rc-cyan)' : '1px solid transparent',
            }}
            title="Mods"
          >
            ◆
          </button>
        </nav>

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden">
          {view === 'rig' ? (
            <>
              {/* Slot grid */}
              <div className="w-[340px] p-4 overflow-y-auto border-r" style={{ borderColor: 'var(--rc-border)' }}>
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-4 px-1"
                  style={{ color: 'var(--rc-text-muted)' }}
                >
                  Cyberware Slots
                  {slotsLoading && (
                    <span className="ml-2 animate-pulse" style={{ color: 'var(--rc-cyan)' }}>
                      ●
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      selected={selectedSlot === slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Detail panel */}
              <div className="flex-1 p-4 overflow-y-auto">
                <SlotDetail slot={activeSlot} />
              </div>
            </>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--rc-text-muted)' }}
                >
                  Installed Mods
                  {modsLoading && (
                    <span className="ml-2 animate-pulse" style={{ color: 'var(--rc-cyan)' }}>
                      ●
                    </span>
                  )}
                </h3>
                <p className="text-xs mb-6" style={{ color: 'var(--rc-text-dim)' }}>
                  {mods.length} mods · {mods.filter((m) => m.enabled).length} active
                </p>
                <ModList mods={mods} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Status bar */}
      <footer
        className="flex items-center justify-between px-4 py-1.5 text-[10px] border-t"
        style={{
          borderColor: 'var(--rc-border)',
          background: 'var(--rc-surface)',
          color: 'var(--rc-text-muted)',
        }}
      >
        <span>
          RIPPERCLAW v0.1.0 · {dataSource === 'live' ? (
            <span style={{ color: 'var(--rc-green)' }}>LIVE</span>
          ) : (
            <span style={{ color: 'var(--rc-magenta)' }}>MOCK</span>
          )}
          {status.gateway === 'running' && (
            <span style={{ color: 'var(--rc-green)' }}> · GW ✓</span>
          )}
        </span>
        <span>LOADOUT: QUINN · {slots.length} SLOTS · {mods.length} MODS</span>
      </footer>
    </div>
  );
}

export default App;
