import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Input } from '@workspace/ui/components/input'
import { SearchIcon } from 'lucide-react'
import { useState } from 'react'
import DataTable from '../../../shared/components/data-table'
import ActionsButton from './actions-button'

export type Applicant = {
  id: number
  name: string
  email: string
  status: 'approved' | 'pending' | 'rejected'
  applicationDate: string
}

type Props = {
  applicants: Applicant[]
}

export default function ApplicantsTable({ applicants }: Props) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState('')

  const columns: ColumnDef<Applicant>[] = [
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
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const getStatusBadge = () => {
          switch (status) {
            case 'approved':
              return <Badge variant="default">Aprobado</Badge>
            case 'pending':
              return <Badge variant="secondary">En revisión</Badge>
            case 'rejected':
              return <Badge variant="destructive">Rechazado</Badge>
            default:
              return <Badge variant="secondary">Desconocido</Badge>
          }
        }
        return getStatusBadge()
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Lista de Postulantes</h3>
        <Badge variant="secondary">{applicants.length} postulantes</Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar postulantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <ActionsButton
          selectedCount={Object.keys(rowSelection).length}
          onDeleteClick={() => {
            console.log('Aceptar seleccionados:', Object.keys(rowSelection))
          }}
        />
      </div>

      <DataTable
        data={applicants}
        columns={columns}
        pagination={pagination}
        paginationOptions={{
          onPaginationChange: setPagination,
          rowCount: applicants.length,
          pageCount: Math.ceil(applicants.length / pagination.pageSize),
        }}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  )
}
