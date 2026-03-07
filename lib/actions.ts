'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateExam(examId: string): Promise<void> {
  revalidatePath(`/exams/${examId}`)
}
