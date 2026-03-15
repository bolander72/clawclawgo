import type { Kit } from '../types'
import registryData from '../../../registry/kits.json'

interface RegistryEntry {
  id: string
  repoUrl: string
  compatibility: string[]
  trustTier: 'verified' | 'community' | 'unreviewed'
  detectedFiles?: string[]
}

interface GitHubRepo {
  name: string
  full_name: string
  description: string | null
  owner: { login: string }
  stargazers_count: number
  forks_count: number
  created_at: string
  pushed_at: string
  default_branch: string
}

// Cache so multiple calls in one build don't re-fetch
let _cache: Kit[] | null = null

export async function getKits(): Promise<Kit[]> {
  if (_cache) return _cache

  const entries = registryData.kits as RegistryEntry[]

  const kits = await Promise.all(entries.map(async (entry) => {
    const repoPath = entry.repoUrl.replace('https://github.com/', '')
    const [owner] = repoPath.split('/')

    // Fetch live metadata from GitHub API
    let gh: GitHubRepo | null = null
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ClawClawGo',
      }
      // Use token if available (5000 req/hr vs 60)
      const token = process.env.GITHUB_TOKEN
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`https://api.github.com/repos/${repoPath}`, { headers })
      if (res.ok) gh = await res.json() as GitHubRepo
    } catch {}

    const kit: Kit = {
      id: entry.id,
      name: gh?.name || repoPath.split('/')[1] || repoPath,
      description: gh?.description || '',
      source: 'github',
      repoUrl: entry.repoUrl,
      owner: gh?.owner?.login || owner,
      stars: gh?.stargazers_count || 0,
      forks: gh?.forks_count || 0,
      lastUpdated: gh?.pushed_at || '',
      creator: `@${gh?.owner?.login || owner}`,
      createdAt: gh?.created_at || '',
      compatibility: entry.compatibility,
      trustTier: entry.trustTier,
      detectedFiles: entry.detectedFiles || [],
      skillCount: 0,
      defaultBranch: gh?.default_branch || 'main',
    }
    return kit
  }))

  _cache = kits
  return kits
}
