import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { QuestionSection } from '@/components/question-section'
import { AnswerKeySection } from '@/components/answer-key-section'
import { fetchExam, fetchAnswerKey, ApiError } from '@/lib/api'

interface Props {
  params: { id: string; specificosId: string }
}

export default async function DualExamPage({ params }: Props) {
  let basicos, especificos, basicosKey, especificosKey

  try {
    ;[basicos, especificos, basicosKey, especificosKey] = await Promise.all([
      fetchExam(params.id),
      fetchExam(params.specificosId),
      fetchAnswerKey(params.id),
      fetchAnswerKey(params.specificosId),
    ])
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {basicos.cargo ?? 'Prova sem cargo'}
        </h1>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs">CEBRASPE</Badge>
          {basicos.exam_code && (
            <Badge variant="outline" className="text-xs font-mono">{basicos.exam_code}</Badge>
          )}
        </div>
      </div>

      {basicosKey && especificosKey && (
        <div className="flex justify-end">
          <Link
            href={`/exams/${params.id}/${params.specificosId}/score`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 gap-1.5 px-3 transition-all hover:bg-primary/80"
          >
            Pontuar prova →
          </Link>
        </div>
      )}

      <Tabs defaultValue="basicos">
        <TabsList variant="line" className="w-full border-b border-border rounded-none p-0 mb-8 justify-start gap-0 overflow-visible">
          <TabsTrigger value="basicos" className="rounded-none px-6 py-3 text-sm font-medium">
            Questões Básicas
            <span className="ml-2 text-xs font-mono opacity-60">
              {basicos.questions.length}/{basicos.expected_questions}
            </span>
          </TabsTrigger>
          <TabsTrigger value="especificos" className="rounded-none px-6 py-3 text-sm font-medium">
            Questões Específicas
            <span className="ml-2 text-xs font-mono opacity-60">
              {especificos.questions.length}/{especificos.expected_questions}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basicos" className="space-y-8">
          <AnswerKeySection examId={params.id} initialAnswerKey={basicosKey} />
          <Separator />
          <QuestionSection examId={params.id} questions={basicos.questions} />
        </TabsContent>

        <TabsContent value="especificos" className="space-y-8">
          <AnswerKeySection examId={params.specificosId} initialAnswerKey={especificosKey} />
          <Separator />
          <QuestionSection examId={params.specificosId} questions={especificos.questions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
