import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="text-center space-y-4 py-16">
      <h2 className="text-xl font-semibold">Prova não encontrada</h2>
      <p className="text-muted-foreground">
        A prova que você procura não existe ou foi removida.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
        Voltar ao início
      </Link>
    </div>
  )
}
