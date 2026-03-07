'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuestionList } from '@/components/question-list'
import { QuestionListBulkSave } from '@/components/question-list-bulk-save'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'

interface Props {
  examId: string
  questions: Question[]
}

export function QuestionSection({ examId, questions }: Props) {
  const [bulkMode, setBulkMode] = useState(false)
  const [expanded, setExpanded] = useState(questions.length <= 50)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-lg font-semibold hover:text-foreground/80 transition-colors"
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              expanded && 'rotate-90',
            )}
          />
          Questões ({questions.length})
        </button>
        {expanded && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkMode((v) => !v)}
          >
            {bulkMode ? 'Edição individual' : 'Editar todas'}
          </Button>
        )}
      </div>
      {expanded &&
        (bulkMode ? (
          <QuestionListBulkSave examId={examId} questions={questions} />
        ) : (
          <QuestionList examId={examId} questions={questions} />
        ))}
    </div>
  )
}
