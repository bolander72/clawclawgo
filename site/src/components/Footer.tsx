import { IconBrandGithub } from '@tabler/icons-react'

export default function Footer() {
  return (
    <footer className="border-t border-rc-border py-6 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <p className="text-rc-text-muted text-xs font-mono">clawclawgo</p>
        <a href="https://github.com/bolander72/clawclawgo" target="_blank" rel="noopener" className="text-rc-text-muted hover:text-rc-text transition-colors">
          <IconBrandGithub size={16} />
        </a>
      </div>
    </footer>
  )
}
