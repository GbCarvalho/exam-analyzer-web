import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { BreakdownItem } from '@/lib/types'

interface Props {
  breakdown: BreakdownItem[]
}

export function BreakdownTable({ breakdown }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Nº</TableHead>
          <TableHead>Sua resposta</TableHead>
          <TableHead>Gabarito</TableHead>
          <TableHead>Resultado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {breakdown.map((item) => (
          <TableRow key={item.question}>
            <TableCell className="font-mono">{item.question}</TableCell>
            <TableCell className="font-mono">{item.candidate ?? '—'}</TableCell>
            <TableCell className="font-mono">{item.correct ?? '—'}</TableCell>
            <TableCell>
              {item.annulled ? (
                <Badge variant="secondary">Anulada</Badge>
              ) : item.hit ? (
                <Badge className="bg-green-600 text-white hover:bg-green-700">
                  Certa
                </Badge>
              ) : (
                <Badge variant="destructive">Errada</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
