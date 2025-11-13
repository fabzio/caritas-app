import DataTable from '@frontend/shared/components/data-table'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Input } from '@workspace/ui/components/input'
import { SearchIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import type { ScholarshipReport } from '../hooks/use-scholarship-reports'
import { useScholarshipReports } from '../hooks/use-scholarship-reports'
import { scholarshipReportsColumns } from './columns'
import { ReportDetailsDialog } from './report-details-dialog'

type Props = {
  scholarshipId: number
  actionSlot?: ReactNode
}

export function ScholarshipReportsTable({
  scholarshipId,
  actionSlot,
}: Readonly<Props>) {
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearch = useDeferredValue(searchTerm)
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedReport, setSelectedReport] =
    useState<ScholarshipReport | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data, isLoading } = useScholarshipReports({
    scholarshipId,
    search: deferredSearch || undefined,
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  })

  const reports = data?.data ?? []

  const paginationState = useMemo(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize],
  )

  useEffect(() => {
    void scholarshipId
    setPagination({ pageIndex: 1, pageSize: 10 })
    setRowSelection({})
    setSorting([])
    setSelectedReport(null)
    setSearchTerm('')
  }, [scholarshipId])

  const handleRowClick = (report: ScholarshipReport) => {
    setSelectedReport(report)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar becado..."
            className="pl-9"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value)
              setPagination((prev) => ({ ...prev, pageIndex: 1 }))
            }}
          />
        </div>

        {actionSlot ? (
          <div className="flex justify-end">{actionSlot}</div>
        ) : null}
      </div>

      <DataTable
        data={reports}
        isLoading={isLoading}
        columns={scholarshipReportsColumns}
        pagination={paginationState}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        paginationOptions={{
          onPaginationChange: (updater) => {
            setRowSelection({})
            setPagination((prev) => {
              const value =
                typeof updater === 'function'
                  ? updater({
                      pageIndex: prev.pageIndex - 1,
                      pageSize: prev.pageSize,
                    })
                  : updater
              return {
                pageIndex: (value.pageIndex ?? 0) + 1,
                pageSize: value.pageSize ?? prev.pageSize,
              }
            })
          },
          rowCount: data?.total ?? 0,
          pageCount: data?.pageCount ?? 1,
        }}
        showPageSizeSelector
        pageSizeOptions={[5, 10, 20]}
        onRowClick={handleRowClick}
      />

      <ReportDetailsDialog
        report={selectedReport}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setSelectedReport(null)
          }
        }}
      />
    </div>
  )
}
