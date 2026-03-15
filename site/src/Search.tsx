import { useState, useMemo } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'
import Nav from './components/Nav'
import Footer from './components/Footer'
import FeedItem from './components/FeedItem'
import type { Kit } from './types'

interface SearchProps {
  kits: Kit[]
}

export default function Search({ kits }: SearchProps) {
  const initialQuery = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('q') || ''
    : ''
  
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery)
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [compatFilter, setCompatFilter] = useState<string | null>(null)

  const filteredKits = useMemo(() => {
    if (!searchQuery.trim() && !sourceFilter && !compatFilter) return []
    const q = searchQuery.toLowerCase().trim()
    const terms = q.split(/\s+/)
    
    return kits
      .filter(kit => {
        if (sourceFilter && kit.source !== sourceFilter) return false
        if (compatFilter && !kit.compatibility.includes(compatFilter)) return false
        if (!q) return true
        
        const searchable = [
          kit.name,
          kit.description || '',
          kit.creator,
          ...(kit.compatibility || []),
        ].join(' ').toLowerCase()
        
        return terms.every(term => searchable.includes(term))
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
  }, [kits, searchQuery, sourceFilter, compatFilter])

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

  return (
    <div className="min-h-screen bg-rc-bg flex flex-col">
      <Nav />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Search bar */}
        <div className="mb-6">
          <div className="flex items-center bg-rc-surface border border-rc-border rounded-lg overflow-hidden focus-within:border-rc-cyan/40 transition-colors">
            <div className="pl-4 pr-2 text-rc-text-muted">
              <IconSearch size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search kits..."
              className="flex-1 py-2.5 px-2 bg-transparent text-rc-text font-mono text-sm placeholder:text-rc-text-muted focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="mr-3 text-rc-text-muted hover:text-rc-text transition-colors"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-[10px] font-mono text-rc-text-muted py-1.5 uppercase tracking-wider">Agent:</span>
            {['claude-code', 'cursor', 'github-copilot', 'gemini-cli', 'windsurf'].map(agent => (
              <button
                key={agent}
                onClick={() => setCompatFilter(compatFilter === agent ? null : agent)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  compatFilter === agent
                    ? 'bg-rc-text text-rc-bg font-bold'
                    : 'text-rc-text-muted hover:text-rc-text-dim'
                }`}
              >
                {agent}
              </button>
            ))}
          </div>
        </div>

        {!searchQuery.trim() && !sourceFilter && !compatFilter && (
          <div className="text-center py-16 text-rc-text-muted text-sm font-mono">
            Start typing to search by name, creator, or compatible agent.
          </div>
        )}

        {(searchQuery.trim() || sourceFilter || compatFilter) && filteredKits.length === 0 && (
          <div className="text-center py-16 text-rc-text-muted text-sm font-mono">
            No kits found. Try adjusting your search or filters.
          </div>
        )}

        {filteredKits.length > 0 && (
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
                {filteredKits.map((kit, i) => (
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
            <div className="mt-3 text-right text-rc-text-muted text-[10px] font-mono">
              {filteredKits.length} {filteredKits.length === 1 ? 'kit' : 'kits'}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
