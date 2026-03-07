'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnswerGrid } from '@/components/answer-grid'
import { ScoreCard } from '@/components/score-card'
import { BreakdownTable } from '@/components/breakdown-table'
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

  async function handleSubmit(answers: (string | null)[]) {
    if (!exam) return
    setLoading(true)
    try {
      const res = await analyzeExam(params.id, answers)
      const fullResult = await getResult(params.id, res.result_id)
      setResult(fullResult)
      setTimeout(() => {
        document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.error('Gabarito não encontrado. Cadastre o gabarito primeiro.')
        router.push(`/exams/${params.id}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Erro ao analisar')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!exam) {
    return <p className="text-muted-foreground">Carregando prova...</p>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gabarito — {exam.cargo ?? 'Prova'}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnswerGrid
            questions={exam.questions}
            provider={exam.provider}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
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
