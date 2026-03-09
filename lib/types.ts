export type Provider = 'cebraspe' | 'fgv' | 'unknown'
export type BookletType = 'basicos' | 'especificos'

export interface ExamSummary {
  exam_id: string
  exam_code: string | null
  provider: Provider
  cargo: string | null
  exam_type: string | null
  booklet_type: BookletType | null
  expected_questions: number
  partial: boolean
  has_answer_key: boolean
}

export interface ProviderMeta {
  id: Provider
  label: string
  description: string
  supports_dual_booklet: boolean
}

export interface Question {
  number: number
  statement: string
  manual?: boolean // TODO: needs backend PATCH /exams/{id}/questions/{number}
}

export interface ExamResponse {
  exam_id: string
  exam_code: string | null
  provider: Provider
  cargo: string | null
  exam_type: string | null
  booklet_type: BookletType | null
  expected_questions: number
  partial: boolean
  questions: Question[]
}

export interface AnswerKeyResponse {
  answer_key_id: string
  answers: Record<string, string>
}

export interface Score {
  correct: number
  wrong: number
  blank: number
  annulled: number
  pct: number
}

export interface AnalyzeResponse {
  result_id: string
  score: Score
}

export interface BreakdownItem {
  question: number
  candidate: string | null
  correct: string | null
  hit: boolean
  annulled: boolean
}

export interface ResultResponse {
  score: Score
  breakdown: BreakdownItem[]
}
