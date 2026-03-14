import { useState, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Relay } from 'nostr-tools'
import { IconSearch, IconX } from '@tabler/icons-react'
import { parseBuildEvent, RELAYS } from './lib/utils'
import Nav from './components/Nav'
import Footer from './components/Footer'
import FeedItem from './components/FeedItem'
import BuildDetail from './components/BuildDetail'
import ApplyWizard from './components/ApplyWizard'
import type { Build } from './types'

export default function Search() {
  // Get initial query from URL
  const initialQuery = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('q') || ''
    : ''
  
  const [builds, setBuilds] = useState<Build[]>([])
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery)
  const [searchFocused, setSearchFocused] = useState<boolean>(false)
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [applyBuild, setApplyBuild] = useState<Build | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  const relayRef = useRef<any>(null)
  const seenIds = useRef<Set<string>>(new Set())

  // Filter builds by search query (client-side)
  const filteredBuilds = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    const terms = q.split(/\s+/)
    return builds.filter(build => {
      const searchable = [
        build.name,
        build.agentName,
        build.creator,
        ...build.tags,
        ...build.items.map(i => i.name),
        (build.content?.meta?.description as string) || '',
        (build.content?.persona?.style as string) || '',
      ].join(' ').toLowerCase()
      return terms.every(term => searchable.includes(term))
    })
  }, [builds, searchQuery])

  // Sync search query to URL
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (value.trim()) {
        url.searchParams.set('q', value)
      } else {
        url.searchParams.delete('q')
      }
      window.history.replaceState({}, '', url.toString())
    }
  }

  // Connect to relay and fetch builds
  useEffect(() => {
    let sub: any = null
    let relay: any = null

    async function connect() {
      try {
        relay = await Relay.connect(RELAYS[0])
        relayRef.current = relay

        sub = relay.subscribe([{ kinds: [38333], limit: 200 }], {
          onevent(event: any) {
            if (seenIds.current.has(event.id)) return
            seenIds.current.add(event.id)

            const build = parseBuildEvent(event)
            if (build) {
              setBuilds(prev => {
                if (prev.find(l => l.id === build.id)) return prev
                const next = [build, ...prev].sort((a, b) => 
                  (typeof b.createdAt === 'number' ? b.createdAt : 0) - (typeof a.createdAt === 'number' ? a.createdAt : 0)
                )
                return next
              })
            }
          },
          oneose() {
            setIsLoading(false)
          },
        })
      } catch (err) {
        console.error('Failed to connect to relay:', err)
        setIsLoading(false)
      }
    }

    connect()

    return () => {
      if (sub) sub.close()
      if (relay) relay.close()
    }
  }, [])

  return (
    <div className="min-h-screen bg-rc-bg flex flex-col">
      <Nav />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Search bar */}
        <div className="mb-8">
          <div className={`
            flex items-center bg-rc-surface border rounded-2xl transition-all duration-300 overflow-hidden
            ${searchFocused ? 'border-rc-cyan/50 shadow-[0_0_20px_rgba(0,240,160,0.08)]' : 'border-rc-border'}
          `}>
            <div className="pl-5 pr-2 text-rc-text-muted">
              <IconSearch size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search for builds by name, skill, model, or tag"
              className="flex-1 py-4 px-2 bg-transparent text-rc-text font-grotesk text-base placeholder:text-rc-text-muted/50 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="mr-4 text-rc-text-muted hover:text-rc-text transition-colors"
              >
                <IconX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-rc-cyan/20 border-t-rc-cyan rounded-full animate-spin mb-4" />
            <p className="text-rc-text-dim text-sm font-mono">Loading builds...</p>
          </div>
        )}

        {/* Empty state — no search query */}
        {!isLoading && !searchQuery.trim() && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-rc-surface border border-rc-border flex items-center justify-center mb-4">
              <IconSearch size={32} className="text-rc-text-muted" />
            </div>
            <p className="text-rc-text text-lg font-grotesk font-medium mb-2">Search for builds</p>
            <p className="text-rc-text-dim text-sm max-w-md text-center">
              Search for builds by name, skill, model, or tag
            </p>
          </div>
        )}

        {/* Empty state — search has no results */}
        {!isLoading && searchQuery.trim() && filteredBuilds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-rc-surface border border-rc-border flex items-center justify-center mb-4">
              <IconSearch size={32} className="text-rc-text-muted" />
            </div>
            <p className="text-rc-text text-lg font-grotesk font-medium mb-2">No matches</p>
            <p className="text-rc-text-dim text-sm max-w-md text-center">
              No builds match "{searchQuery}". Try different keywords or{' '}
              <button onClick={() => handleSearchChange('')} className="text-rc-cyan hover:underline">clear the search</button>.
            </p>
          </div>
        )}

        {/* Results header */}
        {!isLoading && searchQuery.trim() && filteredBuilds.length > 0 && (
          <div className="mb-6">
            <p className="text-rc-text-muted text-sm font-mono">
              {filteredBuilds.length} result{filteredBuilds.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Build list */}
        {filteredBuilds.length > 0 && (
          <div className="space-y-3">
            {filteredBuilds.map((build, i) => (
              <FeedItem
                key={build.id}
                build={build}
                index={i}
                isNew={false}
                onClick={() => setSelectedBuild(build)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <AnimatePresence>
        {selectedBuild && !applyBuild && (
          <BuildDetail
            build={selectedBuild}
            onClose={() => setSelectedBuild(null)}
            onApply={(build) => {
              setSelectedBuild(null)
              setApplyBuild(build)
            }}
          />
        )}
        {applyBuild && (
          <ApplyWizard
            build={applyBuild}
            onClose={() => setApplyBuild(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
