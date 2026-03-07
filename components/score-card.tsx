import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Score } from '@/lib/types'

interface Props {
  score: Score
}

export function ScoreCard({ score }: Props) {
  return (
    <Card id="resultado">
      <CardHeader>
        <CardTitle>Resultado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-4">{score.pct.toFixed(1)}%</div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Corretas</dt>
            <dd className="font-semibold text-green-500">{score.correct}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Erradas</dt>
            <dd className="font-semibold text-red-500">{score.wrong}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Em branco</dt>
            <dd className="font-semibold">{score.blank}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Anuladas</dt>
            <dd className="font-semibold text-yellow-500">{score.annulled}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
