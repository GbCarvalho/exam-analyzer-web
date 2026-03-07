'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadExam } from '@/lib/api'
import { fgvSchema, type FgvFormValues } from '@/lib/upload-schemas'

export function FgvUploadForm() {
  const router = useRouter()
  const [fileName, setFileName] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FgvFormValues>({
    resolver: zodResolver(fgvSchema),
  })

  async function onSubmit(values: FgvFormValues) {
    const fd = new FormData()
    fd.append('files', values.file)
    fd.append('expected_questions', String(values.expectedQuestions))
    fd.append('cargo', values.cargo)
    fd.append('exam_type', values.examType)

    const result = await uploadExam(fd)

    if (result.status === 'duplicate') {
      toast.info('Prova já cadastrada, redirecionando...')
      router.push(`/exams/${result.examId}`)
      return
    }

    if (result.status === 'error') {
      toast.error(result.message)
      return
    }

    if (result.partial) {
      toast.warning('Extração parcial — algumas questões podem estar faltando')
    }

    router.push(`/exams/${result.examId}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="fgv-file" className="text-xs text-muted-foreground uppercase tracking-wider">
          Arquivo PDF
        </Label>
        <label
          htmlFor="fgv-file"
          className={[
            'flex items-center gap-3 px-3 py-2.5 border rounded-md cursor-pointer hover:border-primary/60 transition-colors group',
            errors.file ? 'border-destructive' : 'border-border',
          ].join(' ')}
        >
          <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
            PDF
          </span>
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 truncate">
            {fileName ?? 'Escolher arquivo…'}
          </span>
        </label>
        <input
          id="fgv-file"
          type="file"
          accept=".pdf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null
            setFileName(file?.name ?? null)
            setValue('file', file as File, { shouldValidate: true })
          }}
        />
        {errors.file && <p className="text-xs text-destructive">{errors.file.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fgv-cargo" className="text-xs text-muted-foreground uppercase tracking-wider">
          Cargo
        </Label>
        <Controller
          name="cargo"
          control={control}
          render={({ field }) => (
            <Input
              id="fgv-cargo"
              placeholder="Ex: Auditor Fiscal"
              className={errors.cargo ? 'border-destructive' : ''}
              {...field}
            />
          )}
        />
        {errors.cargo && <p className="text-xs text-destructive">{errors.cargo.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fgv-exam-type" className="text-xs text-muted-foreground uppercase tracking-wider">
            Tipo
          </Label>
          <Controller
            name="examType"
            control={control}
            render={({ field }) => (
              <Input
                id="fgv-exam-type"
                placeholder="TIPO 1"
                className={errors.examType ? 'border-destructive' : ''}
                {...field}
              />
            )}
          />
          {errors.examType && (
            <p className="text-xs text-destructive">{errors.examType.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fgv-expected" className="text-xs text-muted-foreground uppercase tracking-wider">
            Nº de questões
          </Label>
          <Controller
            name="expectedQuestions"
            control={control}
            render={({ field }) => (
              <Input
                id="fgv-expected"
                type="number"
                min={1}
                max={200}
                placeholder="Ex: 60"
                className={errors.expectedQuestions ? 'border-destructive' : ''}
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
          {errors.expectedQuestions && (
            <p className="text-xs text-destructive">{errors.expectedQuestions.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Enviando…
          </span>
        ) : (
          'Enviar prova'
        )}
      </Button>
    </form>
  )
}
