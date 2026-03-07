import { Badge } from '@/components/ui/badge'
import type { Question } from '@/lib/types'

interface Props {
  questions: Question[]
}

export function QuestionList({ questions }: Props) {
  if (questions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Nenhuma questão extraída.</p>
    )
  }

  return (
    <ol className="space-y-3">
      {questions.map((q) => (
        <li key={q.number} className="flex gap-3 text-sm">
          <span className="font-mono text-muted-foreground w-6 shrink-0">
            {q.number}.
          </span>
          <span className="flex-1">{q.statement}</span>
          {q.manual && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              editado
            </Badge>
          )}
        </li>
      ))}
    </ol>
  )
}
