// Client-side GitHub metadata fetcher with localStorage cache.
// Each visitor gets their own 60 req/hr rate limit — scales naturally.

const CACHE_KEY = 'ccg_github_cache'
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

interface GitHubMeta {
  name: string
  description: string
  owner: string
  stars: number
  forks: number
  createdAt: string
  pushedAt: string
  defaultBranch: string
  fetchedAt: number
}

type CacheMap = Record<string, GitHubMeta>

function readCache(): CacheMap {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeCache(cache: CacheMap) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

export async function fetchRepoMeta(repoUrl: string): Promise<GitHubMeta | null> {
  const repoPath = repoUrl.replace('https://github.com/', '')

  // Check cache
  const cache = readCache()
  const cached = cache[repoPath]
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached
  }

  // Fetch from GitHub API
  try {
    const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })
    if (!res.ok) return cached || null // return stale cache on error

    const repo = await res.json()
    const meta: GitHubMeta = {
      name: repo.name,
      description: repo.description || '',
      owner: repo.owner.login,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      createdAt: repo.created_at,
      pushedAt: repo.pushed_at,
      defaultBranch: repo.default_branch,
      fetchedAt: Date.now(),
    }

    cache[repoPath] = meta
    writeCache(cache)
    return meta
  } catch {
    return cached || null
  }
}

// Batch fetch all repos, returns map keyed by repoUrl
export async function fetchAllRepoMeta(repoUrls: string[]): Promise<Record<string, GitHubMeta>> {
  const results: Record<string, GitHubMeta> = {}
  // Fetch in parallel — all independent
  const promises = repoUrls.map(async (url) => {
    const meta = await fetchRepoMeta(url)
    if (meta) results[url] = meta
  })
  await Promise.all(promises)
  return results
}
