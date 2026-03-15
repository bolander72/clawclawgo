import type { Kit } from '../types'
import registryData from '../../../registry/kits.json'

// Build-time: reads static registry data. No API calls.
// A scheduled GitHub Action refreshes stars/description/etc periodically.
export function getKits(): Kit[] {
  return (registryData.kits as any[]).map(entry => {
    const repoPath = entry.repoUrl?.replace('https://github.com/', '') || ''
    const [owner] = repoPath.split('/')
    return {
      id: entry.id,
      name: entry.name || repoPath.split('/')[1] || repoPath,
      description: entry.description || '',
      source: 'github' as const,
      repoUrl: entry.repoUrl,
      owner: entry.owner || owner,
      stars: entry.stars || 0,
      forks: entry.forks || 0,
      lastUpdated: entry.pushedAt || '',
      creator: `@${entry.owner || owner}`,
      createdAt: entry.createdAt || '',
      compatibility: entry.compatibility || [],
      trustTier: entry.trustTier || 'unreviewed',
      detectedFiles: entry.detectedFiles || [],
      skillCount: entry.skillCount || 0,
      defaultBranch: entry.defaultBranch || 'main',
    }
  })
}
