import { ExamUploadForm } from '@/components/exam-upload-form'

export default function HomePage() {
  return (
    <div className="grid md:grid-cols-[1fr_400px] gap-12 md:gap-16 items-start">
      <div className="space-y-8 md:pt-2">
        <div className="space-y-4">
          <p className="text-primary text-xs font-mono tracking-[0.2em] uppercase">
            Concursos Públicos
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-balance">
            Analisador<br />de Provas
          </h1>
        </div>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
          Faça upload da prova e do gabarito, confira sua pontuação e analise cada questão.
        </p>
        <ul className="space-y-2.5">
          {[
            'Extração automática de questões via OCR',
            'Correção com gabarito oficial em PDF',
            'Edição manual de enunciados',
          ].map((feat) => (
            <li key={feat} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
              {feat}
            </li>
          ))}
        </ul>
      </div>
      <ExamUploadForm />
    </div>
  )
}
