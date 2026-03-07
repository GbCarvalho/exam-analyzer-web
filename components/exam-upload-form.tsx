'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadExam } from '@/lib/api'

export function ExamUploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

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
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="h-0.5 bg-primary" />
      <div className="p-6">
        <h2 className="font-semibold text-sm tracking-wide mb-5">Enviar prova</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="file" className="text-xs text-muted-foreground uppercase tracking-wider">
              Arquivo PDF
            </Label>
            <label
              htmlFor="file"
              className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-md cursor-pointer hover:border-primary/60 transition-colors group"
            >
              <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                PDF
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 truncate">
                {fileName ?? 'Escolher arquivo…'}
              </span>
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".pdf"
              required
              className="sr-only"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expected_questions" className="text-xs text-muted-foreground uppercase tracking-wider">
              Número de questões
            </Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="cargo" className="text-xs text-muted-foreground uppercase tracking-wider">
              Cargo{' '}
              <span className="normal-case text-muted-foreground/60">(opcional)</span>
            </Label>
            <Input id="cargo" name="cargo" placeholder="Ex: Auditor Fiscal" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exam_type" className="text-xs text-muted-foreground uppercase tracking-wider">
                Tipo{' '}
                <span className="normal-case text-muted-foreground/60">(opcional)</span>
              </Label>
              <Input id="exam_type" name="exam_type" placeholder="TIPO 1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booklet_type" className="text-xs text-muted-foreground uppercase tracking-wider">
                Caderno{' '}
                <span className="normal-case text-muted-foreground/60">(opcional)</span>
              </Label>
              <Input id="booklet_type" name="booklet_type" placeholder="basicos / especificos" />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processando…
              </span>
            ) : (
              'Enviar prova'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
