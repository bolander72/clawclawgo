import { useState, useCallback } from 'react'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import type { CopyButtonProps } from '../types'

export default function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-rc-text rounded-xl border border-rc-border transition-colors text-sm font-grotesk"
    >
      {copied ? <IconCheck size={16} className="text-rc-green" /> : <IconCopy size={16} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}
