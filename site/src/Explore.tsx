import { useState, useEffect } from 'react'
import FeedItem from './components/FeedItem'
import Nav from './components/Nav'
import Footer from './components/Footer'
import LoadingSprite from './components/LoadingSprite'
import { fetchAllRepoMeta } from './lib/github'
import type { Kit } from './types'

interface ExploreProps {
  kits: Kit[]
}

type SortMode = 'stars' | 'recent'

export default function Explore({ kits: initialKits }: ExploreProps) {
  const [kits, setKits] = useState<Kit[]>(initialKits)
  const [loading, setLoading] = useState(true)
  const [sortMode, setSortMode] = useState<SortMode>('stars')
  const [searchQuery, setSearchQuery] = useState('')

  // Hydrate with GitHub metadata on mount
  useEffect(() => {
    const urls = initialKits.map(k => k.repoUrl).filter(Boolean) as string[]
    fetchAllRepoMeta(urls).then(meta => {
      setKits(initialKits.map(kit => {
        const m = kit.repoUrl ? meta[kit.repoUrl] : null
        if (!m) return kit
        return {
          ...kit,
          name: m.name,
          description: m.description,
          owner: m.owner,
          creator: `@${m.owner}`,
          stars: m.stars,
          forks: m.forks,
          createdAt: m.createdAt,
          lastUpdated: m.pushedAt,
          defaultBranch: m.defaultBranch,
        }
      }))
      setLoading(false)
    })
  }, [initialKits])

  const filtered = kits.filter(kit => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      kit.name.toLowerCase().includes(q) ||
      kit.description?.toLowerCase().includes(q) ||
      kit.creator?.toLowerCase().includes(q) ||
      kit.repoUrl?.toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'stars') return (b.stars || 0) - (a.stars || 0)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="min-h-screen bg-rc-bg flex flex-col">
      <Nav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-1">
          <h1 className="text-xs font-mono font-bold text-rc-text-muted tracking-widest uppercase">
            Kits Leaderboard
          </h1>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search kits..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-rc-surface border border-rc-border rounded-lg px-4 py-2.5 text-rc-text text-sm font-mono placeholder:text-rc-text-muted focus:outline-none focus:border-rc-cyan/40 transition-colors"
          />
        </div>

        {/* Sort tabs */}
        <div className="flex items-center gap-4 mb-4 border-b border-rc-border">
          {([
            ['stars', `All Time (${filtered.length})`],
            ['recent', 'Recent'],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`pb-2 text-xs font-mono transition-colors border-b-2 -mb-px ${
                sortMode === mode
                  ? 'border-rc-text text-rc-text font-bold'
                  : 'border-transparent text-rc-text-muted hover:text-rc-text-dim'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSprite />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-rc-border text-rc-text-muted text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-2 px-3 text-right w-10">#</th>
                  <th className="py-2 px-3 text-left">Kit</th>
                  <th className="py-2 px-3 text-right">Stars</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((kit, i) => (
                  <FeedItem
                    key={kit.id}
                    kit={kit}
                    index={i}
                    rank={i + 1}
                    onClick={() => { window.location.href = `/${kit.id}` }}
                  />
                ))}
              </tbody>
            </table>

            {sorted.length === 0 && (
              <div className="text-center py-12 text-rc-text-muted text-sm font-mono">
                {searchQuery ? 'No kits match your search.' : 'No kits found.'}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
