import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { fetchExams } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function ExamsPage() {
  const exams = await fetchExams()

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-muted-foreground">Nenhuma prova carregada ainda.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-3 transition-all hover:bg-primary/80"
        >
          Fazer upload de prova
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Provas carregadas</h1>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border text-sm font-medium h-8 px-3 transition-all hover:bg-accent"
        >
          + Nova prova
        </Link>
      </div>

      <div className="grid gap-3">
        {exams.map((exam) => (
          <div
            key={exam.exam_id}
            className="rounded-xl bg-card ring-1 ring-foreground/10 p-5 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{exam.cargo ?? 'Prova sem cargo'}</p>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs">
                  {exam.provider.toUpperCase()}
                </Badge>
                {exam.exam_type && (
                  <Badge variant="outline" className="text-xs">{exam.exam_type}</Badge>
                )}
                {exam.booklet_type && (
                  <Badge variant="outline" className="text-xs">{exam.booklet_type}</Badge>
                )}
                {exam.partial && (
                  <Badge variant="destructive" className="text-xs">Extração parcial</Badge>
                )}
                <span className="text-xs text-muted-foreground self-center font-mono">
                  {exam.expected_questions}q
                </span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link
                href={`/exams/${exam.exam_id}`}
                className="inline-flex items-center justify-center rounded-lg border border-border text-sm font-medium h-8 px-3 transition-all hover:bg-accent"
              >
                Ver prova
              </Link>
              {exam.has_answer_key && (
                <Link
                  href={`/exams/${exam.exam_id}/score`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-3 transition-all hover:bg-primary/80"
                >
                  Pontuar
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
