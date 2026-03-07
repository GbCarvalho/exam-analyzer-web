import type {
  ExamResponse,
  AnswerKeyResponse,
  AnalyzeResponse,
  ResultResponse,
} from '@/lib/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function extractMessage(body: unknown): string {
  if (typeof body === 'string') return body
  if (body && typeof body === 'object' && 'detail' in body) {
    const d = (body as { detail: unknown }).detail
    if (typeof d === 'string') return d
    return JSON.stringify(d)
  }
  return 'Erro desconhecido'
}

// ─── Server-side fetchers (use in Server Components) ────────────────────────

export async function fetchExam(examId: string): Promise<ExamResponse> {
  const res = await fetch(`${BASE}/exams/${examId}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, extractMessage(body))
  }
  return res.json()
}

export async function fetchAnswerKey(examId: string): Promise<AnswerKeyResponse | null> {
  const res = await fetch(`${BASE}/exams/${examId}/answer-key`, {
    next: { revalidate: 3600 },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, extractMessage(body))
  }
  return res.json()
}

// ─── Client-side mutations ────────────────────────────────────────────────────

export type UploadExamResult =
  | { status: 'ok'; examId: string; partial: boolean }
  | { status: 'duplicate'; examId: string }
  | { status: 'error'; code: number; message: string }

export async function uploadExam(formData: FormData): Promise<UploadExamResult> {
  try {
    const res = await fetch(`${BASE}/exams`, { method: 'POST', body: formData })

    if (res.status === 409) {
      const body = await res.json().catch(() => null)
      const examId = (body?.detail?.exam_id as string) ?? ''
      return { status: 'duplicate', examId }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return { status: 'error', code: res.status, message: extractMessage(body) }
    }

    const data: ExamResponse = await res.json()
    return { status: 'ok', examId: data.exam_id, partial: res.status === 206 }
  } catch {
    return {
      status: 'error',
      code: 0,
      message: 'Erro de conexão. Verifique se o servidor está rodando.',
    }
  }
}

export async function uploadAnswerKeyPdf(
  examId: string,
  file: File,
): Promise<AnswerKeyResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${BASE}/exams/${examId}/answer-key/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, extractMessage(body))
  }
  return res.json()
}

export async function saveAnswerKey(
  examId: string,
  answers: Record<string, string>,
): Promise<AnswerKeyResponse> {
  const res = await fetch(`${BASE}/exams/${examId}/answer-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, extractMessage(body))
  }
  return res.json()
}

export async function analyzeExam(
  examId: string,
  answers: (string | null)[],
): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE}/exams/${examId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, extractMessage(body))
  }
  return res.json()
}

export async function getResult(
  examId: string,
  resultId: string,
): Promise<ResultResponse> {
  const res = await fetch(`${BASE}/exams/${examId}/results/${resultId}`)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, extractMessage(body))
  }
  return res.json()
}
