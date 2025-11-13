import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import type { ScholarshipReport } from '../hooks/use-scholarship-reports'

export const causeLabels: Record<ScholarshipReport['cause'], string> = {
  absence: 'Inasistencias',
  performance: 'Rendimiento',
  other: 'Otra',
}

export const scholarshipReportsColumns: ColumnDef<ScholarshipReport>[] = [
  {
    accessorKey: 'student',
    header: 'Becado',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.student.name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.student.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'scholarship.name',
    header: 'Beca',
    cell: ({ row }) => row.original.scholarship.name,
    enableSorting: false,
  },
  {
    accessorKey: 'cause',
    header: 'Causa',
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant="outline">{causeLabels[row.original.cause]}</Badge>
    ),
  },
  {
    accessorKey: 'reason.name',
    header: 'Motivo',
    cell: ({ row }) => row.original.reason.name ?? 'Sin motivo',
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha de registro',
    enableSorting: false,
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
  },
]
