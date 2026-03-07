// TODO: Replace localStorage with ElectricSQL or PowerSync when storage layer is decided.
// This module provides a local-first data layer with manual-edit-wins conflict resolution.

export interface LocalQuestion {
  number: number
  statement: string
  manual: boolean
}

/**
 * Merge remote (backend) questions with local overrides.
 * Rule: manual local edits always win over OCR-inferred remote data.
 */
export function mergeQuestions(
  remote: LocalQuestion[],
  local: LocalQuestion[],
): LocalQuestion[] {
  const localMap = new Map(local.map((q) => [q.number, q]))
  return remote.map((remoteQ) => {
    const localQ = localMap.get(remoteQ.number)
    if (localQ?.manual) return localQ
    return remoteQ
  })
}

const QUESTIONS_KEY = (examId: string) => `exam:${examId}:questions`

export function loadLocalQuestions(examId: string): LocalQuestion[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY(examId))
    return raw ? (JSON.parse(raw) as LocalQuestion[]) : []
  } catch {
    return []
  }
}

export function saveLocalQuestion(examId: string, question: LocalQuestion): void {
  if (typeof window === 'undefined') return
  const existing = loadLocalQuestions(examId)
  const updated = existing.filter((q) => q.number !== question.number)
  updated.push(question)
  localStorage.setItem(QUESTIONS_KEY(examId), JSON.stringify(updated))
}

export function clearLocalQuestions(examId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(QUESTIONS_KEY(examId))
}
