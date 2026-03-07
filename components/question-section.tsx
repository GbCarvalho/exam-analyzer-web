'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { QuestionList } from '@/components/question-list'
import { QuestionListBulkSave } from '@/components/question-list-bulk-save'
import type { Question } from '@/lib/types'

interface Props {
  examId: string
  questions: Question[]
}

export function QuestionSection({ examId, questions }: Props) {
  const [bulkMode, setBulkMode] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Questões ({questions.length})</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBulkMode((v) => !v)}
        >
          {bulkMode ? 'Edição individual' : 'Editar todas'}
        </Button>
      </div>
      {bulkMode ? (
        <QuestionListBulkSave examId={examId} questions={questions} />
      ) : (
        <QuestionList examId={examId} questions={questions} />
      )}
    </div>
  )
}
