import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          Analisador de Provas
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
