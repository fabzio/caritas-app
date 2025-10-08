import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Checkbox } from '@workspace/ui/components/checkbox'
import type { Applicant } from '../hooks/use-get-applicant'

function getStatusBadge(status: Applicant['status']) {
  switch (status) {
    case 'accepted':
      return <Badge variant="default">Aceptado</Badge>
    case 'pending':
      return <Badge variant="secondary">En revisión</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rechazado</Badge>
    default:
      return <Badge variant="secondary">Desconocido</Badge>
  }
}

export const applicantsTableColumns: ColumnDef<Applicant>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Postulante',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'applicationDate',
    header: 'Fecha de Postulación',
    cell: ({ row }) =>
      new Date(row.getValue('applicationDate')).toLocaleDateString(),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
]
