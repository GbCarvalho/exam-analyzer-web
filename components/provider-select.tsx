'use client'

import { Label } from '@/components/ui/label'

export type Provider = 'cebraspe' | 'fgv'

const PROVIDERS: { value: Provider; label: string; description: string }[] = [
  {
    value: 'cebraspe',
    label: 'CEBRASPE',
    description: 'Questões C/E — suporta dois cadernos (básicos + específicos)',
  },
  {
    value: 'fgv',
    label: 'FGV',
    description: 'Questões A–E — caderno único por cargo e tipo',
  },
]

interface Props {
  value: Provider | null
  onChange: (provider: Provider) => void
}

export function ProviderSelect({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
        Banca organizadora
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={[
              'flex flex-col gap-0.5 rounded-md border px-3 py-2.5 text-left transition-colors',
              value === p.value
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
