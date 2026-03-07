import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="border-b border-border/60 bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-1 h-5 rounded-full bg-primary transition-all group-hover:h-4" />
          <span className="text-xl font-semibold tracking-tight">
            Analisador de Provas
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
