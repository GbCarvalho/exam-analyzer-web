import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">
                {exam.cargo ?? 'Prova sem cargo'}
              </CardTitle>
              {exam.exam_code && (
                <p className="text-muted-foreground text-sm mt-1">
                  Código: {exam.exam_code}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Badge variant="outline">{exam.provider.toUpperCase()}</Badge>
              {exam.exam_type && <Badge variant="outline">{exam.exam_type}</Badge>}
              {exam.booklet_type && (
                <Badge variant="outline">{exam.booklet_type}</Badge>
              )}
              {exam.partial && (
                <Badge variant="destructive">Extração parcial</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {exam.questions.length} de {exam.expected_questions} questões extraídas
          </p>
        </CardHeader>
      </Card>

      <AnswerKeySection examId={params.id} initialAnswerKey={answerKey} />

      {answerKey && (
        <div className="flex justify-end">
          <Link
            href={`/exams/${params.id}/score`}
            className={cn(buttonVariants())}
          >
            Ir para gabarito →
          </Link>
        </div>
      )}

      <Separator />

      <QuestionSection examId={params.id} questions={exam.questions} />
    </div>
  )
}
