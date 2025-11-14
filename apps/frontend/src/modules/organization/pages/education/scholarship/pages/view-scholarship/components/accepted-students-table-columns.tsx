import type { ColumnDef } from '@tanstack/react-table'
import type { AcceptedStudent } from '../hooks/use-get-accepted-students'

export const acceptedStudentsTableColumns: ColumnDef<AcceptedStudent>[] = [
  {
    accessorKey: 'name',
    header: 'Estudiante',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'reviewDate',
    header: 'Fecha Becado',
    cell: ({ row }) =>
      new Date(row.getValue('reviewDate')).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
  },
]
