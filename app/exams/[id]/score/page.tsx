'use client'

import { useState, useEffect, useReducer } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnswerGridOverview } from '@/components/answer-grid-overview'
import { AnswerSingleQuestion } from '@/components/answer-single-question'
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { ScoreCard } from '@/components/score-card'
import { BreakdownTable } from '@/components/breakdown-table'
import { gridReducer, createInitialState } from '@/lib/answer-grid-reducer'
import { analyzeExam, getResult, ApiError } from '@/lib/api'
import type { ExamResponse, ResultResponse } from '@/lib/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function ScorePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [exam, setExam] = useState<ExamResponse | null>(null)
  const [result, setResult] = useState<ResultResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API}/exams/${params.id}`)
      .then((r) => {
        if (r.status === 404) {
          router.replace(`/exams/${params.id}`)
          return null
        }
        return r.json()
      })
      .then((data) => data && setExam(data))
      .catch(() => toast.error('Erro ao carregar prova'))
  }, [params.id, router])

  if (!exam) {
    return <p className="text-muted-foreground">Carregando prova...</p>
  }

  return (
    <ScorePageContent
      exam={exam}
      examId={params.id}
      result={result}
      setResult={setResult}
      loading={loading}
      setLoading={setLoading}
      router={router}
    />
  )
}

function ScorePageContent({
  exam,
  examId,
  result,
  setResult,
  loading,
  setLoading,
  router,
}: {
  exam: ExamResponse
  examId: string
  result: ResultResponse | null
  setResult: (r: ResultResponse | null) => void
  loading: boolean
  setLoading: (l: boolean) => void
  router: ReturnType<typeof useRouter>
}) {
  const count = exam.questions.length
  const [state, dispatch] = useReducer(gridReducer, createInitialState(count, 'all'))

  const answered = state.answers.filter((a) => a !== null).length
  const allFilled = answered === count

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await analyzeExam(examId, state.answers)
      const fullResult = await getResult(examId, res.result_id)
      setResult(fullResult)
      setTimeout(() => {
        document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.error('Gabarito não encontrado. Cadastre o gabarito primeiro.')
        router.push(`/exams/${examId}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Erro ao analisar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gabarito — {exam.cargo ?? 'Prova'}</CardTitle>
            <KeyboardShortcutsDialog mode={state.mode} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={state.mode === 'all' ? 'default' : 'outline'}
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'all' })}
            >
              Visão geral
            </Button>
            <Button
              size="sm"
              variant={state.mode === 'single' ? 'default' : 'outline'}
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'single' })}
            >
              Questão individual
            </Button>
          </div>

          {/* Active mode component */}
          {state.mode === 'all' && (
            <AnswerGridOverview
              state={state}
              dispatch={dispatch}
              provider={exam.provider}
              count={count}
            />
          )}

          {state.mode === 'single' && (
            <AnswerSingleQuestion
              state={state}
              dispatch={dispatch}
              questions={exam.questions}
              provider={exam.provider}
            />
          )}

          {/* Progress + submit */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {answered} / {count} respondidas
            </span>
            <Button onClick={handleSubmit} disabled={loading || !allFilled}>
              {loading ? 'Analisando...' : 'Ver resultado'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div id="resultado" className="space-y-6">
          <ScoreCard score={result.score} />
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownTable breakdown={result.breakdown} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
