import DataTable from '@frontend/shared/components/data-table'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { SearchIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import type { ScholarshipReport } from '../hooks/use-scholarship-reports'
import { useScholarshipReports } from '../hooks/use-scholarship-reports'
import { scholarshipReportsColumns } from './columns'
import { ReportDetailsDialog } from './report-details-dialog'

type ScholarshipOption = {
  label: string
  value: number
}

type Props = {
  scholarshipId: number
  scholarshipOptions: ScholarshipOption[]
  actionSlot?: ReactNode
}

export function ScholarshipReportsTable({
  scholarshipId,
  scholarshipOptions,
  actionSlot,
}: Readonly<Props>) {
  const [selectedScholarship, setSelectedScholarship] = useState(scholarshipId)
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearch = useDeferredValue(searchTerm)
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedReport, setSelectedReport] =
    useState<ScholarshipReport | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    setSelectedScholarship(scholarshipId)
    setRowSelection({})
    setSorting([])
    setSelectedReport(null)
  }, [scholarshipId])

  const { data, isLoading } = useScholarshipReports({
    scholarshipId: selectedScholarship,
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

  const handleRowClick = (report: ScholarshipReport) => {
    setSelectedReport(report)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center">
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

          <Select
            value={selectedScholarship.toString()}
            onValueChange={(value) => {
              const newValue = Number(value)
              setSelectedScholarship(newValue)
              setPagination({ pageIndex: 1, pageSize: pagination.pageSize })
              setRowSelection({})
              setSorting([])
              setSelectedReport(null)
            }}
            disabled={scholarshipOptions.length === 0}
          >
            <SelectTrigger className="w-full lg:w-[260px]">
              <SelectValue placeholder="Selecciona una beca" />
            </SelectTrigger>
            <SelectContent>
              {scholarshipOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
