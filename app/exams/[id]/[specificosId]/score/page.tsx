'use client'

import { useState, useEffect, useReducer, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnswerGridOverview } from '@/components/answer-grid-overview'
import { AnswerSingleQuestion } from '@/components/answer-single-question'
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { ScoreCard } from '@/components/score-card'
import { BreakdownTable } from '@/components/breakdown-table'
import { gridReducer, createInitialState, type GridState, type GridAction } from '@/lib/answer-grid-reducer'
import { analyzeExam, ApiError } from '@/lib/api'
import type { ExamResponse, ResultResponse } from '@/lib/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export default function DualScorePage() {
  const params = useParams<{ id: string; specificosId: string }>()
  const router = useRouter()
  const [basicos, setBasicos] = useState<ExamResponse | null>(null)
  const [especificos, setEspecificos] = useState<ExamResponse | null>(null)

  useEffect(() => {
    const redirectTo = `/exams/${params.id}/${params.specificosId}`
    Promise.all([
      fetch(`${API}/exams/${params.id}`),
      fetch(`${API}/exams/${params.specificosId}`),
    ])
      .then(async ([r1, r2]) => {
        if (r1.status === 404 || r2.status === 404) {
          router.replace(redirectTo)
          return
        }
        const [b, e] = await Promise.all([r1.json(), r2.json()])
        setBasicos(b)
        setEspecificos(e)
      })
      .catch(() => toast.error('Erro ao carregar provas'))
  }, [params.id, params.specificosId, router])

  if (!basicos || !especificos) {
    return <p className="text-muted-foreground">Carregando provas...</p>
  }

  return (
    <DualScoreContent
      basicos={basicos}
      especificos={especificos}
      basicosId={params.id}
      especificosId={params.specificosId}
      router={router}
    />
  )
}

function DualScoreContent({
  basicos,
  especificos,
  basicosId,
  especificosId,
  router,
}: {
  basicos: ExamResponse
  especificos: ExamResponse
  basicosId: string
  especificosId: string
  router: ReturnType<typeof useRouter>
}) {
  const [basicosState, basicosDispatch] = useReducer(
    gridReducer,
    createInitialState(basicos.questions.length, 'all'),
  )
  const [especificosState, especificosDispatch] = useReducer(
    gridReducer,
    createInitialState(especificos.questions.length, 'all'),
  )
  const [result, setResult] = useState<{
    basicos: ResultResponse
    especificos: ResultResponse
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const basicosAnswered = basicosState.answers.filter((a) => a !== null).length
  const especificosAnswered = especificosState.answers.filter((a) => a !== null).length
  const allFilled =
    basicosAnswered === basicos.questions.length &&
    especificosAnswered === especificos.questions.length

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    try {
      const [resBasicos, resEspecificos] = await Promise.all([
        analyzeExam(basicosId, basicosState.answers),
        analyzeExam(especificosId, especificosState.answers),
      ])
      const [fullBasicos, fullEspecificos] = await Promise.all([
        fetch(`${API}/exams/${basicosId}/results/${resBasicos.result_id}`).then((r) => r.json()),
        fetch(`${API}/exams/${especificosId}/results/${resEspecificos.result_id}`).then((r) =>
          r.json(),
        ),
      ])
      setResult({ basicos: fullBasicos, especificos: fullEspecificos })
      setTimeout(() => {
        document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.error('Gabarito não encontrado. Cadastre o gabarito primeiro.')
        router.push(`/exams/${basicosId}/${especificosId}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Erro ao analisar')
      }
    } finally {
      setLoading(false)
    }
  }, [basicosId, especificosId, basicosState.answers, especificosState.answers, router])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gabarito — {basicos.cargo ?? 'Prova'}</CardTitle>
            <KeyboardShortcutsDialog mode={basicosState.mode} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="basicos">
            <TabsList variant="line" className="w-full border-b border-border rounded-none p-0 mb-6 justify-start gap-0 overflow-visible">
              <TabsTrigger value="basicos" className="rounded-none px-6 py-3 text-sm font-medium">
                Questões Básicas
                <span className="ml-2 text-xs font-mono opacity-60">
                  {basicosAnswered}/{basicos.questions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="especificos" className="rounded-none px-6 py-3 text-sm font-medium">
                Questões Específicas
                <span className="ml-2 text-xs font-mono opacity-60">
                  {especificosAnswered}/{especificos.questions.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basicos">
              <BookletGrid
                state={basicosState}
                dispatch={basicosDispatch}
                exam={basicos}
                answered={basicosAnswered}
              />
            </TabsContent>
            <TabsContent value="especificos">
              <BookletGrid
                state={especificosState}
                dispatch={especificosDispatch}
                exam={especificos}
                answered={especificosAnswered}
              />
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {basicosAnswered + especificosAnswered} / {basicos.questions.length + especificos.questions.length} respondidas no total
            </span>
            <Button onClick={handleSubmit} disabled={loading || !allFilled}>
              {loading ? 'Analisando...' : 'Ver resultado'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div id="resultado" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground px-1">Questões Básicas</p>
              <ScoreCard score={result.basicos.score} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground px-1">Questões Específicas</p>
              <ScoreCard score={result.especificos.score} />
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento — Questões Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownTable breakdown={result.basicos.breakdown} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento — Questões Específicas</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownTable breakdown={result.especificos.breakdown} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function BookletGrid({
  state,
  dispatch,
  exam,
  answered,
}: {
  state: GridState
  dispatch: React.Dispatch<GridAction>
  exam: ExamResponse
  answered: number
}) {
  return (
    <div className="space-y-4">
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

      {state.mode === 'all' && (
        <AnswerGridOverview
          state={state}
          dispatch={dispatch}
          provider={exam.provider}
          count={exam.questions.length}
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

      <p className="text-sm text-muted-foreground pt-2 border-t">
        {answered} / {exam.questions.length} respondidas
      </p>
    </div>
  )
}
