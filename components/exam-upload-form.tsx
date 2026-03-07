'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadExam } from '@/lib/api'

export function ExamUploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const result = await uploadExam(fd)

    if (result.status === 'duplicate') {
      toast.info('Prova já cadastrada, redirecionando...')
      router.push(`/exams/${result.examId}`)
      return
    }

    if (result.status === 'error') {
      toast.error(result.message)
      setLoading(false)
      return
    }

    if (result.partial) {
      toast.warning('Extração parcial — algumas questões podem estar faltando')
    }

    router.push(`/exams/${result.examId}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar prova</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo PDF da prova</Label>
            <Input id="file" name="file" type="file" accept=".pdf" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_questions">Número de questões</Label>
            <Input
              id="expected_questions"
              name="expected_questions"
              type="number"
              min={1}
              max={200}
              placeholder="Ex: 100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">
              Cargo{' '}
              <span className="text-muted-foreground text-sm">(opcional)</span>
            </Label>
            <Input id="cargo" name="cargo" placeholder="Ex: Auditor Fiscal" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam_type">
                Tipo de prova{' '}
                <span className="text-muted-foreground text-sm">(opcional)</span>
              </Label>
              <Input id="exam_type" name="exam_type" placeholder="Ex: TIPO 1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booklet_type">
                Caderno{' '}
                <span className="text-muted-foreground text-sm">(opcional)</span>
              </Label>
              <Input
                id="booklet_type"
                name="booklet_type"
                placeholder="basicos ou especificos"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar prova'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
