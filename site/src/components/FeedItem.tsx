import type { Kit } from '../types'
import { IconStar } from '@tabler/icons-react'

interface FeedItemProps {
  kit: Kit
  index: number
  rank: number
  onClick: () => void
}

function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toString()
}

export default function FeedItem({ kit, rank, onClick }: FeedItemProps) {
  const repoPath = kit.repoUrl?.replace('https://github.com/', '') || ''

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-rc-border/50 hover:bg-rc-surface/50 transition-colors group"
    >
      {/* Rank */}
      <td className="py-3 px-3 text-rc-text-muted text-sm font-mono w-10 text-right">
        {rank}
      </td>

      {/* Kit name + repo */}
      <td className="py-3 px-3">
        <span className="font-grotesk font-bold text-rc-text group-hover:text-rc-cyan transition-colors text-sm">
          {kit.name}
        </span>
        {repoPath && (
          <span className="text-rc-text-muted text-xs font-mono ml-2">
            {repoPath}
          </span>
        )}
      </td>

      {/* Stars */}
      <td className="py-3 px-3 text-right whitespace-nowrap">
        {kit.stars != null && kit.stars > 0 && (
          <span className="text-rc-text-dim text-sm font-mono inline-flex items-center gap-1">
            <IconStar size={12} className="text-rc-yellow" />
            {formatStars(kit.stars)}
          </span>
        )}
      </td>
    </tr>
  )
}
