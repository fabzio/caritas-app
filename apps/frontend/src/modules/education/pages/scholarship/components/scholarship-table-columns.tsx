import MoreMenu from '@frontend/shared/components/more-button'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Edit, Eye, Trash } from 'lucide-react'

export type Scholarship = {
  id: string
  name: string
  organizationName: string
  vacancies?: number
}

export const scholarshipTableColumns: ColumnDef<Scholarship>[] = [
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
    id: 'index',
    header: 'N°',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'organizationName',
    header: 'Organización',
  },
  {
    accessorKey: 'vacancies',
    header: 'Postulantes',
    cell: ({ row }) => (
      <span className="text-left block">{row.original.vacancies ?? 0}</span>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <MoreMenu
        items={[
          {
            label: 'Ver',
            icon: <Eye className="w-4 h-4" />,
            to: `/education/scholarship/${row.original.id}/view`,
          },
          {
            label: 'Editar',
            icon: <Edit className="w-4 h-4" />,
            to: `/education/scholarship/${row.original.id}/edit`,
          },
          {
            label: 'Eliminar',
            icon: <Trash className="w-4 h-4" />,
            destructive: true,
            onClick: () => {
              // eslint-disable-next-line no-alert
              alert(`Eliminar ${row.original.name}`)
            },
          },
        ]}
      />
    ),
    enableSorting: false,
  },
]
