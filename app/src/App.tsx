import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BlockCard } from './components/BlockCard';
import { BlockDetail } from './components/BlockDetail';
import { ModList } from './components/ModList';
import { CompareView } from './components/CompareView';
import { FeedView } from './components/FeedView';
import { BuildsView } from './components/BuildsView';
import { PublishDialog } from './components/PublishDialog';
import { ApplyWizard } from './components/ApplyWizard';
import { SettingsView } from './components/SettingsView';
import { useBlocks, useSkills, useSystemStatus, useCloneBuild, useAgents } from './hooks/useTauri';
import { blocks as mockBlocks, mods as mockMods } from './data/mockBuild';

type View = 'build' | 'mods' | 'builds' | 'compare' | 'feed' | 'settings';

function CloneToast({ result }: { result: { message: string; type: 'success' | 'error' } | null }) {
  if (!result) return null;
  return (
    <div
      className="fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-xs font-semibold z-50 transition-all"
      style={{
        background: result.type === 'success' ? 'var(--rc-green)' : 'var(--rc-red)',
        color: 'var(--rc-bg)',
      }}
    >
      {result.message}
    </div>
  );
}

function App() {
  const [selectedBlock, setSelectedBlock] = useState('soul');
  const [view, setView] = useState<View>('build');
  const [showPublish, setShowPublish] = useState(false);
  const [compareTarget, setCompareTarget] = useState<Record<string, unknown> | null>(null);
  const [cloneResult, setCloneResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | undefined>(undefined);
  const [applyTarget, setApplyTarget] = useState<Record<string, unknown> | null>(null);
  const { cloneBuild } = useCloneBuild();

  const { data: agents } = useAgents();
  const { data: realBlocks, loading: blocksLoading, error: blocksError } = useBlocks(activeAgent);
  const { data: realMods, loading: modsLoading } = useSkills();
  const { data: status } = useSystemStatus();

  // Set initial active agent once loaded
  useEffect(() => {
    if (agents.length > 0 && !activeAgent) {
      const defaultAgent = agents.find(a => a.is_default) || agents[0];
      setActiveAgent(defaultAgent.id);
    }
  }, [agents]);

  const blocks = realBlocks.length > 0 ? realBlocks : mockBlocks;
  const mods = realMods.length > 0 ? realMods : mockMods;

  const activeBlock = blocks.find((s) => s.id === selectedBlock) ?? blocks[0];

  useEffect(() => {
    if (blocks.length > 0 && !blocks.find((s) => s.id === selectedBlock)) {
      setSelectedBlock(blocks[0].id);
    }
  }, [blocks]);

  const dataSource = blocksError ? 'mock' : 'live';

  const navItems: { id: View; icon: string; label: string }[] = [
    { id: 'build', icon: '⬡', label: 'Active Build' },
    { id: 'mods', icon: '◆', label: 'Mods' },
    { id: 'builds', icon: '▤', label: 'Builds' },
    { id: 'compare', icon: '⊕', label: 'Compare' },
    { id: 'feed', icon: '◎', label: 'The Feed' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar nav */}
        <nav
          className="w-14 flex flex-col items-center py-4 gap-2 border-r"
          style={{ borderColor: 'var(--rc-border)', background: 'var(--rc-surface)' }}
        >
          {/* Agent selector (only when multiple agents) */}
          {agents.length > 1 && (
            <div className="mb-2 pb-2 w-full flex flex-col items-center gap-1" style={{ borderBottom: '1px solid var(--rc-border)' }}>
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent.id)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase transition-all"
                  style={{
                    background: activeAgent === agent.id ? 'var(--rc-overlay-light)' : 'transparent',
                    color: activeAgent === agent.id ? 'var(--rc-cyan)' : 'var(--rc-text-muted)',
                    border: activeAgent === agent.id ? '1px solid var(--rc-cyan)' : '1px solid transparent',
                  }}
                  title={agent.name || agent.id}
                >
                  {(agent.name || agent.id).slice(0, 2)}
                </button>
              ))}
            </div>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{
                background: view === item.id ? 'var(--rc-overlay-light)' : 'transparent',
                color: view === item.id ? 'var(--rc-cyan)' : 'var(--rc-text-muted)',
                border: view === item.id ? '1px solid var(--rc-cyan)' : '1px solid transparent',
              }}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}

          <div className="flex-1" />

          {/* Publish button */}
          <button
            onClick={() => setShowPublish(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-80"
            style={{
              background: 'var(--rc-overlay-light)',
              color: 'var(--rc-cyan)',
              border: '1px solid var(--rc-cyan-dim)',
            }}
            title="Publish Build"
          >
            ▲
          </button>
        </nav>

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden">
          {view === 'build' && (
            <>
              {/* Block grid */}
              <div className="w-[340px] p-4 overflow-y-auto border-r" style={{ borderColor: 'var(--rc-border)' }}>
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-4 px-1"
                  style={{ color: 'var(--rc-text-muted)' }}
                >
                  Blocks
                  {blocksLoading && (
                    <span className="ml-2 animate-pulse" style={{ color: 'var(--rc-cyan)' }}>●</span>
                  )}
                </h3>
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <BlockCard
                      key={block.id}
                      block={block}
                      selected={selectedBlock === block.id}
                      onClick={() => setSelectedBlock(block.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Detail panel */}
              <div className="flex-1 p-4 overflow-y-auto">
                <BlockDetail block={activeBlock} />
              </div>
            </>
          )}

          {view === 'mods' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--rc-text-muted)' }}
                >
                  Installed Mods
                  {modsLoading && (
                    <span className="ml-2 animate-pulse" style={{ color: 'var(--rc-cyan)' }}>●</span>
                  )}
                </h3>
                <p className="text-xs mb-6" style={{ color: 'var(--rc-text-dim)' }}>
                  {mods.length} mods · {mods.filter((m) => m.enabled).length} active
                </p>
                <ModList mods={mods} />
              </div>
            </div>
          )}

          {view === 'builds' && (
            <BuildsView
              onCompare={(build) => {
                setCompareTarget(build as Record<string, unknown>);
                setView('compare');
              }}
              onApply={(build) => {
                setApplyTarget(build as Record<string, unknown>);
              }}
            />
          )}

          {view === 'compare' && (
            <CompareView
              currentBlocks={blocks}
              currentMods={mods}
              currentName="Quinn"
              initialBuild={compareTarget}
              onClear={() => setCompareTarget(null)}
              onClone={async (build, mode) => {
                const json = JSON.stringify(build);
                const res = await cloneBuild(json, mode, activeAgent);
                if (res) {
                  const msg = mode === 'new'
                    ? `Saved as build: ${res.block_changes[0] || 'done'}`
                    : `Applied to ${activeAgent || 'agent'}. ${res.applied_skills.length} skills, ${res.skipped_skills.length} skipped. ${res.block_changes.length} changes.`;
                  setCloneResult({ message: msg, type: 'success' });
                  setTimeout(() => setCloneResult(null), 6000);
                } else {
                  setCloneResult({ message: 'Clone failed', type: 'error' });
                  setTimeout(() => setCloneResult(null), 4000);
                }
              }}
            />
          )}

          {view === 'feed' && (
            <FeedView
              onCompare={(build) => {
                setCompareTarget(build as Record<string, unknown>);
                setView('compare');
              }}
            />
          )}

          {view === 'settings' && <SettingsView />}
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
        <span>LOADOUT: QUINN · {blocks.length} SLOTS · {mods.length} MODS</span>
      </footer>

      {/* Clone result toast */}
      <CloneToast result={cloneResult as { message: string; type: 'success' | 'error' } | null} />

      {/* Publish dialog */}
      {showPublish && <PublishDialog onClose={() => setShowPublish(false)} />}

      {/* Apply wizard */}
      {applyTarget != null ? (
        <ApplyWizard
          build={applyTarget as any}
          agents={agents}
          onClose={() => setApplyTarget(null)}
          onComplete={() => {
            setCloneResult({ message: 'Agent created! Restart OpenClaw to activate.', type: 'success' });
            setTimeout(() => setCloneResult(null), 8000);
          }}
        />
      ) : null}
    </div>
  );
}

export default App;
