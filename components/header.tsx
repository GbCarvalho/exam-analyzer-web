import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="border-b border-border/60 bg-background/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-1 h-5 rounded-full bg-primary transition-all group-hover:h-4" />
          <span className="font-display text-xl italic tracking-wide">
            Analisador de Provas
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
