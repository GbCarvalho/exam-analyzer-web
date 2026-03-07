'use client'

import { useState } from 'react'
import type { ProviderMeta } from '@/lib/types'
import { ProviderSelect, type SelectedProvider } from '@/components/provider-select'
import { CebraspecUploadForm } from '@/components/cebraspe-upload-form'
import { FgvUploadForm } from '@/components/fgv-upload-form'

interface Props {
  providers: ProviderMeta[]
}

export function ExamUploadForm({ providers }: Props) {
  const [provider, setProvider] = useState<SelectedProvider | null>(null)

  function handleProviderChange(next: SelectedProvider) {
    setProvider(next)
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="h-1 bg-primary" />
      <div className="p-7">
        <h2 className="font-bold text-base mb-6">Enviar prova</h2>
        <div className="space-y-5">
          <ProviderSelect providers={providers} value={provider} onChange={handleProviderChange} />
          {provider === 'cebraspe' && <CebraspecUploadForm />}
          {provider === 'fgv' && <FgvUploadForm />}
        </div>
      </div>
    </div>
  )
}
