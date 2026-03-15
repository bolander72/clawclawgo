import { useState } from 'react'
import { IconMenu2, IconX } from '@tabler/icons-react'

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-rc-border bg-rc-bg/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-grotesk font-bold text-rc-text text-lg hover:text-rc-cyan transition-colors">
          ClawClawGo
        </a>
        
        <nav className="hidden md:flex items-center gap-5 text-sm">
          <a href="/about" className="text-rc-text-dim hover:text-rc-cyan transition-colors">About</a>
          <a href="/docs/" className="text-rc-text-dim hover:text-rc-cyan transition-colors">Docs</a>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-rc-text hover:text-rc-cyan transition-colors"
        >
          {mobileMenuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rc-border bg-rc-bg">
          <nav className="flex flex-col p-4 gap-3 text-sm">
            <a href="/about" className="text-rc-text-dim hover:text-rc-cyan transition-colors">About</a>
            <a href="/docs/" className="text-rc-text-dim hover:text-rc-cyan transition-colors">Docs</a>
          </nav>
        </div>
      )}
    </header>
  )
}
