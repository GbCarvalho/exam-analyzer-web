'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadAnswerKeyPdf, saveAnswerKey, ApiError } from '@/lib/api'
import type { AnswerKeyResponse } from '@/lib/types'

interface Props {
  examId: string
  initialAnswerKey: AnswerKeyResponse | null
}

export function AnswerKeySection({ examId, initialAnswerKey }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(
    initialAnswerKey ? 'edit' : 'upload',
  )
  const [editedAnswers, setEditedAnswers] = useState<Record<string, string>>(
    initialAnswerKey?.answers ?? {},
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      await uploadAnswerKeyPdf(examId, file)
      toast.success('Gabarito importado com sucesso')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao importar gabarito')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveEdits() {
    setLoading(true)
    try {
      await saveAnswerKey(examId, editedAnswers)
      toast.success('Gabarito salvo')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar gabarito')
    } finally {
      setLoading(false)
    }
  }

  const sortedEntries = Object.entries(editedAnswers).sort(
    ([a], [b]) => Number(a) - Number(b),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gabarito</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as string)}>
          <TabsList>
            <TabsTrigger value="upload">Importar via PDF</TabsTrigger>
            <TabsTrigger value="edit">Editar gabarito</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="sr-only"
              disabled={loading}
              onChange={handlePdfUpload}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/60 py-10 px-6 transition-all cursor-pointer group disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {loading ? 'Enviando…' : 'Clique para selecionar o PDF do gabarito'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: .pdf
                </p>
              </div>
            </button>
          </TabsContent>

          <TabsContent value="edit" className="pt-4">
            {sortedEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum gabarito cadastrado. Faça upload de um PDF primeiro.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {sortedEntries.map(([num, ans]) => (
                    <div key={num} className="space-y-1">
                      <label className="text-xs text-muted-foreground font-mono">
                        Q{num}
                      </label>
                      <Input
                        className="h-8 text-center font-mono uppercase"
                        maxLength={1}
                        value={ans ?? ''}
                        onChange={(e) =>
                          setEditedAnswers((prev) => ({
                            ...prev,
                            [num]: e.target.value.toUpperCase(),
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={handleSaveEdits} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar gabarito'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
