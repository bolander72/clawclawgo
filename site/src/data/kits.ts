import type { Kit } from '../types'
import registryData from '../../../registry/kits.json'

// Build-time: passes through registry pointers as-is.
// GitHub metadata (stars, description, etc.) is fetched client-side.
export function getKits(): Kit[] {
  return (registryData.kits as any[]).map(entry => {
    const repoPath = entry.repoUrl?.replace('https://github.com/', '') || ''
    const [owner, repo] = repoPath.split('/')
    return {
      id: entry.id,
      name: repo || repoPath,
      description: '',
      source: 'github' as const,
      repoUrl: entry.repoUrl,
      owner,
      stars: 0,
      forks: 0,
      lastUpdated: '',
      creator: `@${owner}`,
      createdAt: '',
      compatibility: entry.compatibility || [],
      trustTier: entry.trustTier || 'unreviewed',
      detectedFiles: entry.detectedFiles || [],
      skillCount: 0,
      defaultBranch: 'main',
    }
  })
}
