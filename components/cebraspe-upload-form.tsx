'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadExam } from '@/lib/api'
import { cebraspecSchema, type CebraspecFormValues } from '@/lib/upload-schemas'

function FileInput({
  label,
  error,
  onChange,
}: {
  label: string
  error?: string
  onChange: (file: File | null) => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const id = label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <label
        htmlFor={id}
        className={[
          'flex items-center gap-3 px-3 py-2.5 border rounded-md cursor-pointer hover:border-primary/60 transition-colors group',
          error ? 'border-destructive' : 'border-border',
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
        id={id}
        type="file"
        accept=".pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          setFileName(file?.name ?? null)
          onChange(file)
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function CebraspecUploadForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CebraspecFormValues>({
    resolver: zodResolver(cebraspecSchema),
  })

  async function onSubmit(values: CebraspecFormValues) {
    const basicosFd = new FormData()
    basicosFd.append('files', values.basicosFile)
    basicosFd.append('expected_questions', String(values.expectedQuestions))
    basicosFd.append('cargo', values.cargo)
    basicosFd.append('booklet_type', 'basicos')

    const basicosResult = await uploadExam(basicosFd)

    if (basicosResult.status === 'error') {
      toast.error(`Erro ao enviar básicos: ${basicosResult.message}`)
      return
    }

    const basicosId = basicosResult.examId

    const especificosFd = new FormData()
    especificosFd.append('files', values.especificosFile)
    especificosFd.append('expected_questions', String(values.expectedQuestions))
    especificosFd.append('cargo', values.cargo)
    especificosFd.append('booklet_type', 'especificos')

    const especificosResult = await uploadExam(especificosFd)

    if (especificosResult.status === 'error') {
      toast.error(`Básicos enviados (${basicosId}), mas erro nos específicos: ${especificosResult.message}`)
      return
    }

    const especificosId = especificosResult.examId

    if (
      (basicosResult.status === 'ok' && basicosResult.partial) ||
      (especificosResult.status === 'ok' && especificosResult.partial)
    ) {
      toast.warning('Extração parcial — algumas questões podem estar faltando')
    }

    router.push(`/exams/${basicosId}/${especificosId}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FileInput
        label="Caderno Básico (PDF)"
        error={errors.basicosFile?.message}
        onChange={(file) => setValue('basicosFile', file as File, { shouldValidate: true })}
      />
      <FileInput
        label="Caderno Específico (PDF)"
        error={errors.especificosFile?.message}
        onChange={(file) => setValue('especificosFile', file as File, { shouldValidate: true })}
      />
      <div className="space-y-1.5">
        <Label htmlFor="cargo" className="text-xs text-muted-foreground uppercase tracking-wider">
          Cargo
        </Label>
        <Input
          id="cargo"
          placeholder="Ex: Auditor Fiscal"
          {...register('cargo')}
          className={errors.cargo ? 'border-destructive' : ''}
        />
        {errors.cargo && <p className="text-xs text-destructive">{errors.cargo.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="expectedQuestions"
          className="text-xs text-muted-foreground uppercase tracking-wider"
        >
          Número de questões
        </Label>
        <Input
          id="expectedQuestions"
          type="number"
          min={1}
          max={200}
          placeholder="Ex: 120"
          {...register('expectedQuestions')}
          className={errors.expectedQuestions ? 'border-destructive' : ''}
        />
        {errors.expectedQuestions && (
          <p className="text-xs text-destructive">{errors.expectedQuestions.message}</p>
        )}
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
