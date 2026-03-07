import { ExamUploadForm } from '@/components/exam-upload-form'

export default function HomePage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analisador de Provas</h1>
      <ExamUploadForm />
    </div>
  )
}
