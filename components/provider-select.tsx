'use client'

import type { ProviderMeta } from '@/lib/types'
import { Label } from '@/components/ui/label'

export type { ProviderMeta }
export type SelectedProvider = ProviderMeta['id']

interface Props {
  providers: ProviderMeta[]
  value: SelectedProvider | null
  onChange: (provider: SelectedProvider) => void
}

export function ProviderSelect({ providers, value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
        Banca organizadora
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {providers.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={[
              'flex flex-col gap-0.5 rounded-md border px-3 py-2.5 text-left transition-colors',
              value === p.id
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
            ].join(' ')}
          >
            <span className="text-sm font-semibold">{p.label}</span>
            <span className="text-[11px] leading-snug">{p.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
