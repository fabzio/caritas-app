import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { ArrowUpDown } from 'lucide-react'

export type Fair = {
  id: number
  title: string
  district: string
  date: Date
  address: string
  startTime: string
  endTime: string
  active: boolean
  status: 'upcoming' | 'ongoing' | 'finished'
  assistanceCount?: number | null
}

export const fairTableColumns: ColumnDef<Fair>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nombre de la feria
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <span>{row.original.title}</span>,
  },
  {
    accessorKey: 'district',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-3"
      >
        Distrito
        <ArrowUpDown />
      </Button>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-3"
      >
        Fecha
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) =>
      row.original.date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.original.status

      if (status === 'upcoming') {
        return <Badge variant="outline">Próxima</Badge>
      }

      if (status === 'ongoing') {
        return <Badge variant="default">En curso</Badge>
      }

      return <Badge variant="secondary">Finalizada</Badge>
    },
  },
  {
    accessorKey: 'assistanceCount',
    header: 'Asistentes',
    enableSorting: false,
    cell: ({ row }) => {
      if (row.original.status !== 'finished') return '—'
      if (typeof row.original.assistanceCount === 'number') {
        return row.original.assistanceCount.toLocaleString('es-PE')
      }
      return 'Sin registro'
    },
  },
]
