import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center space-y-4 py-16">
      <h2 className="text-xl font-semibold">Prova não encontrada</h2>
      <p className="text-muted-foreground">
        A prova que você procura não existe ou foi removida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted hover:text-foreground transition-all"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
