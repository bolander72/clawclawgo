import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  IconBrain, IconCpu, IconMicrophone,
  IconMessageCircle, IconCalendar, IconMail, IconCheckbox, IconSmartHome, IconBrandGithub,
  IconWaveSine, IconPalette, IconTerminal2, IconWorldSearch, IconNote,
  IconUser, IconFingerprint, IconUserCircle,
  IconDatabase, IconNotebook, IconHeartHandshake, IconPinned,
  IconHeartbeat, IconClock, IconBell,
  IconCube, IconPlug, IconBolt, IconSparkles, IconServer, IconClockHour4,
  IconArrowDown, IconExternalLink, IconCopy, IconChevronRight,
} from '@tabler/icons-react'
import { loadouts } from './loadouts'

// ─── Helpers ───────────────────────────────────────────────

const slotColors = {
  Model: 'from-purple-500/20 to-blue-500/20',
  Integrations: 'from-green-500/20 to-cyan-500/20',
  Skills: 'from-pink-500/20 to-violet-500/20',
  Personality: 'from-cyan-500/20 to-emerald-500/20',
  Memory: 'from-amber-500/20 to-orange-500/20',
  Scheduling: 'from-rose-500/20 to-blue-500/20',
}

const slotIcons = {
  Model: IconCube,
  Integrations: IconPlug,
  Skills: IconBolt,
  Personality: IconSparkles,
  Memory: IconServer,
  Scheduling: IconClockHour4,
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Hero Section ──────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rc-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-rc-magenta/3 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-3xl relative z-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rc-cyan/10 border border-rc-cyan/20 text-rc-cyan text-xs font-mono tracking-wider mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rc-cyan animate-pulse" />
          OPEN SOURCE AI AGENTS
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-grotesk font-bold text-rc-text mb-6 leading-[1.1] tracking-tight">
          Your AI.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rc-cyan via-rc-green to-rc-cyan">
            Your loadout.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg md:text-xl text-rc-text-dim max-w-2xl mx-auto mb-4 leading-relaxed">
          OpenClaw agents are built from loadouts — the models, integrations, skills, and personality
          that make each one unique. Browse what others have built. Copy what works. Make it yours.
        </p>

        <p className="text-sm text-rc-text-muted max-w-lg mx-auto mb-10">
          Every loadout below is a real agent configuration. Click any card to see the full build,
          or copy the entire loadout to bootstrap your own.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/openclaw/openclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-rc-cyan text-rc-bg font-grotesk font-semibold rounded-xl hover:bg-rc-cyan/90 transition-colors flex items-center gap-2"
          >
            Get OpenClaw
            <IconExternalLink size={16} />
          </a>
          <button
            onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 bg-white/5 text-rc-text font-grotesk font-semibold rounded-xl hover:bg-white/10 transition-colors border border-rc-border flex items-center gap-2"
          >
            Browse Loadouts
            <IconArrowDown size={16} />
          </button>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border-2 border-rc-text-muted/30 flex items-start justify-center p-1"
        >
          <motion.div className="w-1 h-2 rounded-full bg-rc-text-muted/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Loadout Card (Conveyor Item) ──────────────────────────

function LoadoutCard({ loadout, index, onClick, dropped }) {
  const totalItems = loadout.slots.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <motion.div
      initial={dropped ? { y: -400, opacity: 0, rotate: -5 } : { opacity: 0, y: 20 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={
        dropped
          ? { type: 'spring', stiffness: 120, damping: 18, delay: index * 0.12 }
          : { delay: index * 0.08, duration: 0.4 }
      }
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="relative cursor-pointer shrink-0 w-[280px] group"
    >
      {/* Card */}
      <div className="bg-rc-surface rounded-2xl border border-rc-border group-hover:border-rc-cyan/40 transition-all duration-300 overflow-hidden">
        {/* NEW badge */}
        {loadout.isNew && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rc-cyan/15 border border-rc-cyan/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rc-cyan animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-rc-cyan tracking-wider">NEW</span>
            <span className="text-[10px] font-mono text-rc-cyan/60">{formatDate(loadout.createdAt)}</span>
          </div>
        )}

        {/* Mini slot grid preview */}
        <div className="p-5 pt-12">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {loadout.slots.slice(0, 6).map((slot, si) => {
              const Icon = slotIcons[slot.name] || IconCube
              return (
                <div
                  key={si}
                  className={`aspect-square rounded-xl bg-gradient-to-br ${slotColors[slot.name] || 'from-white/5 to-white/10'} border border-white/5 flex flex-col items-center justify-center gap-1 p-2`}
                >
                  <Icon size={16} stroke={1.5} className="text-rc-text-dim" />
                  <span className="text-[9px] font-mono text-rc-text-muted truncate w-full text-center">
                    {slot.items.length}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card footer */}
        <div className="px-5 pb-5">
          {/* Agent name + loadout type */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-grotesk font-bold text-rc-text text-base truncate">
                {loadout.agentName}
              </h3>
              <span className="text-rc-text-muted text-xs">·</span>
              <span className="text-rc-text-dim text-xs font-mono truncate">
                {loadout.name}
              </span>
            </div>
          </div>

          {/* Creator + stats */}
          <div className="flex items-center justify-between">
            <span className="text-rc-cyan/70 text-xs font-mono">
              {loadout.creator}
            </span>
            <span className="text-rc-text-muted text-[10px] font-mono">
              {loadout.slots.length} slots · {totalItems} items
            </span>
          </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-rc-cyan/5 via-transparent to-transparent" />
      </div>
    </motion.div>
  )
}

// ─── Conveyor Belt ─────────────────────────────────────────

function ConveyorBelt({ onSelectLoadout }) {
  const [dropped, setDropped] = useState(false)
  const trackRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Trigger drop animation after mount
    const timer = setTimeout(() => setDropped(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Duplicate loadouts for seamless scroll
  const displayLoadouts = [...loadouts, ...loadouts]

  return (
    <section id="showcase" className="relative py-16 overflow-hidden">
      {/* Section header */}
      <div className="text-center mb-12 px-6">
        <h2 className="text-2xl md:text-3xl font-grotesk font-bold text-rc-text mb-3">
          Community Loadouts
        </h2>
        <p className="text-rc-text-dim text-sm max-w-md mx-auto">
          Real agent configurations from the community. New loadouts drop in as they're shared.
        </p>
      </div>

      {/* Spotlight overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-rc-bg to-transparent" />
        <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-rc-bg to-transparent" />
      </div>

      {/* Moving spotlight */}
      <motion.div
        className="absolute top-0 w-[300px] h-full pointer-events-none z-5"
        animate={{ left: ['-300px', 'calc(100% + 300px)'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-rc-cyan/[0.03] to-transparent" />
      </motion.div>

      {/* Conveyor track */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-6 px-6"
          style={{
            animation: `scroll ${loadouts.length * 5}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {dropped &&
            displayLoadouts.map((loadout, i) => (
              <LoadoutCard
                key={`${loadout.id}-${i}`}
                loadout={loadout}
                index={i % loadouts.length}
                onClick={() => onSelectLoadout(loadout)}
                dropped={i < loadouts.length}
              />
            ))}
        </div>
      </div>

      {/* Track line */}
      <div className="mt-8 mx-6">
        <div className="h-px bg-gradient-to-r from-transparent via-rc-border to-transparent" />
      </div>
    </section>
  )
}

// ─── Loadout Detail Modal ──────────────────────────────────

function LoadoutDetail({ loadout, onClose }) {
  const [expandedSlot, setExpandedSlot] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-rc-surface rounded-3xl border border-rc-border shadow-2xl relative my-8"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-rc-border">
          <div className="flex items-start justify-between">
            <div>
              {loadout.isNew && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rc-cyan/15 border border-rc-cyan/30 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rc-cyan animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-rc-cyan tracking-wider">NEW</span>
                  <span className="text-[10px] font-mono text-rc-cyan/60">{formatDate(loadout.createdAt)}</span>
                </div>
              )}
              <h2 className="text-3xl font-grotesk font-bold text-rc-text mb-1">
                {loadout.agentName}
              </h2>
              <p className="text-rc-text-dim text-sm">
                <span className="text-rc-cyan/70 font-mono">{loadout.creator}</span>
                {' · '}
                {loadout.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => showToast('Loadout copied!')}
                className="px-4 py-2 bg-rc-cyan/10 hover:bg-rc-cyan/20 text-rc-cyan rounded-lg transition-colors text-sm font-medium border border-rc-cyan/20 flex items-center gap-2"
              >
                <IconCopy size={14} />
                Copy Loadout
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-rc-text"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Slots grid */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {loadout.slots.map((slot, si) => {
              const Icon = slotIcons[slot.name] || IconCube
              const isExpanded = expandedSlot === si

              return (
                <motion.div
                  key={si}
                  layout
                  onClick={() => setExpandedSlot(isExpanded ? null : si)}
                  className={`cursor-pointer rounded-2xl border transition-all duration-200 ${
                    isExpanded
                      ? 'col-span-2 md:col-span-3 bg-white/5 border-rc-cyan/30'
                      : 'bg-rc-surface border-rc-border hover:border-rc-cyan/30'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-rc-cyan">
                        <Icon size={18} stroke={1.5} />
                      </div>
                      <span className="font-grotesk font-semibold text-rc-text text-sm">
                        {slot.name}
                      </span>
                      <span className="text-rc-text-muted text-xs ml-auto font-mono">
                        {slot.items.length}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        className="text-rc-text-muted"
                      >
                        <IconChevronRight size={14} />
                      </motion.div>
                    </div>

                    {!isExpanded && (
                      <div className="flex flex-wrap gap-1">
                        {slot.items.slice(0, 3).map((item, ii) => (
                          <span
                            key={ii}
                            className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] font-mono text-rc-text-dim"
                          >
                            {item.name}
                          </span>
                        ))}
                        {slot.items.length > 3 && (
                          <span className="px-2 py-0.5 text-[10px] font-mono text-rc-text-muted">
                            +{slot.items.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {slot.items.map((item, ii) => (
                            <motion.div
                              key={ii}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: ii * 0.04 }}
                              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                            >
                              <div className={`w-2 h-2 rounded-full ${item.color?.replace('text-', 'bg-') || 'bg-rc-text-dim'}`} />
                              <span className="font-grotesk text-sm text-rc-text">
                                {item.name}
                              </span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-rc-cyan rounded-full text-rc-bg font-grotesk font-medium text-sm shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// ─── Footer ────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-16 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl md:text-2xl font-grotesk font-bold text-rc-text mb-4">
          Build yours.
        </h3>
        <p className="text-rc-text-dim text-sm mb-8 max-w-md mx-auto">
          OpenClaw is open source. Install it, pick your models, wire up your integrations,
          give it a personality — then share your loadout with the community.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://github.com/openclaw/openclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-rc-text rounded-xl transition-colors text-sm font-medium border border-rc-border flex items-center gap-2"
          >
            <IconBrandGithub size={16} />
            GitHub
          </a>
          <a
            href="https://docs.openclaw.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-rc-text rounded-xl transition-colors text-sm font-medium border border-rc-border"
          >
            Docs
          </a>
          <a
            href="https://discord.com/invite/clawd"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-rc-text rounded-xl transition-colors text-sm font-medium border border-rc-border"
          >
            Discord
          </a>
        </div>
        <p className="text-rc-text-muted text-xs mt-12 font-mono">
          openclaw · open source ai agents
        </p>
      </div>
    </footer>
  )
}

// ─── App ───────────────────────────────────────────────────

export default function App() {
  const [selectedLoadout, setSelectedLoadout] = useState(null)

  return (
    <div className="min-h-screen bg-rc-bg scanlines">
      <Hero />
      <ConveyorBelt onSelectLoadout={setSelectedLoadout} />
      <Footer />

      <AnimatePresence>
        {selectedLoadout && (
          <LoadoutDetail
            loadout={selectedLoadout}
            onClose={() => setSelectedLoadout(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
