import { useMemo, useState, useEffect } from 'react'
import { marked } from 'marked'
import { IconBrandGithub, IconExternalLink, IconArrowLeft, IconTerminal2, IconShield, IconAlertTriangle, IconStar } from '@tabler/icons-react'
import { formatDate } from '../lib/utils'
import { fetchRepoMeta } from '../lib/github'
import CopyButton from './CopyButton'
import type { Kit } from '../types'

const TRUST_BADGES = {
  verified: { label: 'VERIFIED', color: 'bg-green-400/15 border-green-400/30 text-green-400', icon: IconShield },
  community: { label: 'COMMUNITY', color: 'bg-blue-400/15 border-blue-400/30 text-blue-400', icon: null },
  unreviewed: { label: 'UNREVIEWED', color: 'bg-amber-400/15 border-amber-400/30 text-amber-400', icon: IconAlertTriangle },
}

export default function KitPage({ kit: initialKit, readme }: { kit: Kit; readme: string }) {
  const [kit, setKit] = useState<Kit>(initialKit)

  // Hydrate with live GitHub metadata
  useEffect(() => {
    if (!initialKit.repoUrl) return
    fetchRepoMeta(initialKit.repoUrl).then(m => {
      if (!m) return
      setKit(prev => ({
        ...prev,
        name: m.name,
        description: m.description,
        owner: m.owner,
        creator: `@${m.owner}`,
        stars: m.stars,
        forks: m.forks,
        createdAt: m.createdAt,
        lastUpdated: m.pushedAt,
        defaultBranch: m.defaultBranch,
      }))
    })
  }, [initialKit.repoUrl])

  const trustBadge = TRUST_BADGES[kit.trustTier]
  const TrustIcon = trustBadge.icon

  const cloneCommand = kit.repoUrl ? `git clone ${kit.repoUrl}.git` : null
  const addCommand = kit.repoUrl
    ? `npx clawclawgo add ${kit.repoUrl.replace('https://github.com/', '')}`
    : null

  // Render markdown README
  const readmeHtml = useMemo(() => {
    if (!readme) return ''
    // Resolve relative image/link URLs to GitHub
    const repoPath = kit.repoUrl?.replace('https://github.com/', '') || ''
    const branch = kit.defaultBranch || 'main'
    const rawBase = `https://raw.githubusercontent.com/${repoPath}/${branch}/`
    const repoBase = `https://github.com/${repoPath}/blob/${branch}/`

    // Configure marked to resolve relative URLs
    const renderer = new marked.Renderer()
    const originalImage = renderer.image.bind(renderer)
    const originalLink = renderer.link.bind(renderer)

    renderer.image = function ({ href, title, text }: { href: string; title?: string | null; text: string }) {
      const resolved = href && !href.startsWith('http') && !href.startsWith('data:')
        ? rawBase + href
        : href
      return `<img src="${resolved}" alt="${text || ''}" ${title ? `title="${title}"` : ''} />`
    }

    renderer.link = function ({ href, title, tokens }: { href: string; title?: string | null; tokens: any[] }) {
      const resolved = href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')
        ? repoBase + href
        : href
      const text = this.parser.parseInline(tokens)
      return `<a href="${resolved}" target="_blank" rel="noopener noreferrer" ${title ? `title="${title}"` : ''}>${text}</a>`
    }

    return marked.parse(readme, { renderer }) as string
  }, [readme, kit.repoUrl])

  return (
    <div className="min-h-screen bg-rc-bg">
      {/* Header */}
      <header className="border-b border-rc-border bg-rc-bg/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-rc-text-dim hover:text-rc-cyan transition-colors text-sm font-grotesk"
          >
            <IconArrowLeft size={16} />
            Back
          </a>
          <div className="h-5 w-px bg-rc-border" />
          <a href="/" className="font-grotesk font-bold text-rc-text text-lg hover:text-rc-cyan transition-colors">
            ClawClawGo
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Kit header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${trustBadge.color}`}>
              {TrustIcon && <TrustIcon size={12} />}
              <span className="text-[10px] font-mono font-bold tracking-wider">{trustBadge.label}</span>
            </div>
            {kit.source === 'github' && kit.stars && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rc-yellow/15 border border-rc-yellow/30">
                <IconStar size={12} className="text-rc-yellow" />
                <span className="text-[10px] font-mono font-bold text-rc-yellow">{kit.stars.toLocaleString()}</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-grotesk font-bold text-rc-text mb-2">
            {kit.name}
          </h1>
          <p className="text-rc-text-dim text-lg mb-3">
            {kit.description}
          </p>
          <p className="text-rc-text-muted text-sm">
            <span className="text-rc-cyan/70 font-mono">{kit.creator}</span>
            {' · '}
            <span className="font-mono">{formatDate(kit.createdAt)}</span>
          </p>
        </div>

        {/* Get This Kit */}
        <div className="pb-6 mb-6 border-b border-rc-border">
          {/* Primary: View on GitHub */}
          {kit.repoUrl && (
            <a
              href={kit.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 bg-rc-cyan text-rc-bg rounded-xl hover:bg-rc-cyan/90 transition-colors text-sm font-grotesk font-semibold mb-4"
            >
              <IconBrandGithub size={18} />
              View on GitHub
              <IconExternalLink size={14} className="opacity-60" />
            </a>
          )}

          {/* Clone command */}
          {cloneCommand && (
            <div className="mb-3">
              <p className="text-rc-text-muted text-xs font-mono mb-2">Clone:</p>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3 border border-rc-border">
                <code className="flex-1 text-xs font-mono text-rc-text overflow-x-auto">
                  {cloneCommand}
                </code>
                <CopyButton text={cloneCommand} />
              </div>
            </div>
          )}

          {/* CLI add command */}
          {addCommand && (
            <div>
              <p className="text-rc-text-muted text-xs font-mono mb-2">Or use the CLI (clones + scans):</p>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3 border border-rc-border">
                <IconTerminal2 size={14} className="text-rc-text-muted shrink-0" />
                <code className="flex-1 text-xs font-mono text-rc-text overflow-x-auto">
                  {addCommand}
                </code>
                <CopyButton text={addCommand} />
              </div>
            </div>
          )}
        </div>

        {/* README */}
        {readmeHtml && (
          <div className="readme-content">
            <div
              className="prose prose-invert max-w-none
                prose-headings:text-white prose-headings:font-grotesk prose-headings:border-b prose-headings:border-rc-border prose-headings:pb-2
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-rc-text prose-p:leading-relaxed
                prose-a:text-rc-cyan prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-code:text-rc-cyan prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-black/40 prose-pre:border prose-pre:border-rc-border prose-pre:rounded-xl
                prose-img:rounded-xl prose-img:border prose-img:border-rc-border
                prose-li:text-rc-text prose-li:marker:text-rc-cyan
                prose-blockquote:border-rc-cyan/30 prose-blockquote:text-rc-text-dim
                prose-table:text-sm prose-th:text-rc-text prose-td:text-rc-text-dim prose-th:border-rc-border prose-td:border-rc-border
                prose-hr:border-rc-border"
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          </div>
        )}

        {!readmeHtml && (
          <div className="text-center py-12 text-rc-text-muted">
            <p className="text-sm font-mono">No README available</p>
            {kit.repoUrl && (
              <a
                href={kit.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rc-cyan hover:underline text-sm mt-2 inline-block"
              >
                View repository on GitHub →
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
