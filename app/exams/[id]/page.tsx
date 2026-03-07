import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { QuestionSection } from '@/components/question-section'
import { AnswerKeySection } from '@/components/answer-key-section'
import { fetchExam, fetchAnswerKey, ApiError } from '@/lib/api'

interface Props {
  params: { id: string }
}

export default async function ExamPage({ params }: Props) {
  let exam, answerKey

  try {
    exam = await fetchExam(params.id)
    answerKey = await fetchAnswerKey(params.id)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="font-display text-3xl italic">
              {exam.cargo ?? 'Prova sem cargo'}
            </h1>
            {exam.exam_code && (
              <p className="text-muted-foreground text-sm mt-1 font-mono">
                {exam.exam_code}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-end shrink-0 pt-1">
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
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-mono">{exam.questions.length}</span>
          {' '}de{' '}
          <span className="font-mono">{exam.expected_questions}</span>
          {' '}questões extraídas
        </p>
      </div>

      <AnswerKeySection examId={params.id} initialAnswerKey={answerKey} />

      {answerKey && (
        <div className="flex justify-end">
          <Link href={`/exams/${params.id}/score`} className={cn(buttonVariants())}>
            Ir para gabarito →
          </Link>
        </div>
      )}

      <Separator />

      <QuestionSection examId={params.id} questions={exam.questions} />
    </div>
  )
}
