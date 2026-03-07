'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { patchQuestion, ApiError } from '@/lib/api'
import type { Question } from '@/lib/types'

interface Props {
  examId: string
  questions: Question[]
}

function AutoSizeTextarea({
  defaultValue,
  onBlur,
  ariaLabel,
}: {
  defaultValue: string
  onBlur: (value: string) => void
  ariaLabel: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    resize()
  }, [resize])

  return (
    <textarea
      ref={ref}
      className="w-full bg-transparent resize-vertical leading-relaxed outline-none focus:ring-1 focus:ring-ring rounded px-2 py-1 text-sm"
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      onInput={resize}
      onBlur={(e) => onBlur(e.target.value.trim())}
      autoFocus
    />
  )
}

function QuestionItem({
  examId,
  question,
}: {
  examId: string
  question: Question
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave(newStatement: string) {
    setEditing(false)
    if (newStatement === question.statement) return
    setSaving(true)
    try {
      await patchQuestion(examId, question.number, newStatement)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar questão')
    } finally {
      setSaving(false)
    }
  }

  const preview =
    question.statement.length > 80
      ? question.statement.slice(0, 80) + '...'
      : question.statement

  return (
    <li className="rounded-lg bg-card ring-1 ring-foreground/[0.06] transition-colors hover:ring-foreground/10">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-3 w-full p-4 text-left text-sm"
      >
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-90',
          )}
        />
        <span className="font-mono text-muted-foreground w-7 shrink-0 text-right">
          {question.number}.
        </span>
        {!expanded && (
          <span className="text-muted-foreground truncate flex-1">
            {preview}
          </span>
        )}
        <div className="flex gap-1 shrink-0 items-center ml-auto">
          {saving && (
            <span className="text-xs text-muted-foreground">salvando...</span>
          )}
          {question.manual && !saving && (
            <Badge variant="secondary" className="text-xs">editado</Badge>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pl-[3.75rem]">
          {editing ? (
            <AutoSizeTextarea
              defaultValue={question.statement}
              onBlur={handleSave}
              ariaLabel={`Enunciado da questão ${question.number}`}
            />
          ) : (
            <div
              onClick={() => setEditing(true)}
              className="prose prose-sm dark:prose-invert max-w-none cursor-text rounded px-2 py-1 hover:bg-muted/40 transition-colors"
              title="Clique para editar"
            >
              <ReactMarkdown>{question.statement}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export function QuestionList({ examId, questions }: Props) {
  if (questions.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhuma questão extraída.</p>
  }

  return (
    <ol className="space-y-2">
      {questions.map((q) => (
        <QuestionItem key={q.number} examId={examId} question={q} />
      ))}
    </ol>
  )
}
