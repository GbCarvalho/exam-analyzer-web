'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
  const [editedAnswers, setEditedAnswers] = useState<Record<string, string>>(
    initialAnswerKey?.answers ?? {},
  )

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
        <Tabs defaultValue={initialAnswerKey ? 'edit' : 'upload'}>
          <TabsList>
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            <TabsTrigger value="edit">Editar gabarito</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-4">
            <div className="space-y-2">
              <label className="text-sm">Arquivo PDF do gabarito</label>
              <Input
                type="file"
                accept=".pdf"
                disabled={loading}
                onChange={handlePdfUpload}
              />
            </div>
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
                        value={ans}
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
