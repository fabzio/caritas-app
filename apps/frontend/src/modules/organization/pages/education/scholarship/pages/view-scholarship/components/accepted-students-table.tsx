import DataTable from '@frontend/shared/components/data-table'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Input } from '@workspace/ui/components/input'
import { SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useGetAcceptedStudents } from '../hooks/use-get-accepted-students'
import { acceptedStudentsTableColumns } from './accepted-students-table-columns'

type Props = {
  scholarshipId: number
}

export default function AcceptedStudentsTable({
  scholarshipId,
}: Readonly<Props>) {
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const { data: studentsData, isLoading } = useGetAcceptedStudents(
    scholarshipId,
    searchTerm,
  )

  const students = studentsData?.data ?? []

  const filteredStudents = useMemo(() => {
    if (!students) return []
    return students
  }, [students])

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="font-medium text-lg">Lista de Becados</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar estudiantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        data={filteredStudents ?? []}
        isLoading={isLoading}
        columns={acceptedStudentsTableColumns}
        pagination={pagination}
        paginationOptions={{
          onPaginationChange: setPagination,
          rowCount: filteredStudents?.length ?? 0,
          pageCount: Math.ceil(
            (filteredStudents?.length ?? 0) / pagination.pageSize,
          ),
        }}
        sorting={sorting}
        onSortingChange={setSorting}
        setRowSelection={setRowSelection}
        rowSelection={rowSelection}
      />
    </div>
  )
}
