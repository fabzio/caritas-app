import DataTable from '@frontend/shared/components/data-table'
import type { SortingState } from '@tanstack/react-table'
import { Input } from '@workspace/ui/components/input'
import { CheckCircle2, Clock, SearchIcon, Users, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAcceptApplicants } from '../hooks/use-accept-applicants'
import { useGetApplicants } from '../hooks/use-get-applicant'
import { useRejectApplicants } from '../hooks/use-reject-applicant'
import ActionsButton from './actions-button'
import { applicantsTableColumns } from './applicants-table-columns'

type Props = {
  scholarshipId: number
}

export default function ApplicantsTable({ scholarshipId }: Readonly<Props>) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState('')

  const { data: applicantsData, isLoading } = useGetApplicants(scholarshipId)
  const { mutateAsync: acceptApplicants, isPending: isAccepting } =
    useAcceptApplicants()
  const { mutateAsync: rejectApplicants, isPending: isRejecting } =
    useRejectApplicants()

  const applicants = applicantsData?.applicants ?? []
  const vacancies = applicantsData?.vacancies

  const stats = useMemo(() => {
    const total = applicants.length
    const accepted = applicants.filter((a) => a.status === 'accepted').length
    const rejected = applicants.filter((a) => a.status === 'rejected').length
    return { total, accepted, rejected }
  }, [applicants])

  const filteredApplicants = useMemo(() => {
    if (!applicants) return []
    if (!searchTerm.trim()) return applicants

    const normalizedSearch = searchTerm.toLowerCase().trim()
    return applicants.filter((applicant) =>
      applicant.name?.toLowerCase().includes(normalizedSearch),
    )
  }, [applicants, searchTerm])

  const selectedIds = useMemo(() => {
    return Object.keys(rowSelection)
      .map((index) => filteredApplicants?.[Number(index)]?.id)
      .filter((id): id is number => id !== undefined)
  }, [rowSelection, filteredApplicants])

  const handleAccept = async () => {
    if (!selectedIds.length) {
      toast.error('Selecciona al menos un postulante')
      return
    }
    await acceptApplicants({ ids: selectedIds })
    setRowSelection({})
  }

  const handleReject = async () => {
    if (!selectedIds.length) {
      toast.error('Selecciona al menos un postulante')
      return
    }
    await rejectApplicants({ ids: selectedIds })
    setRowSelection({})
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="font-medium text-lg">Lista de Postulantes</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background">
            <Users className="h-4 w-4" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-medium">Total:</span>
              <span className="text-lg font-bold">{stats.total}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background">
            <CheckCircle2 className="h-4 w-4" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-medium">Aceptados:</span>
              <span className="text-lg font-bold">{stats.accepted}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background">
            <XCircle className="h-4 w-4" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-medium">Rechazados:</span>
              <span className="text-lg font-bold">{stats.rejected}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background">
            <Clock className="h-4 w-4" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-medium">Vacantes:</span>
              <span className="text-lg font-bold">
                {vacancies?.accepted}/{vacancies?.total}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                ({vacancies?.remaining} disp.)
              </span>
            </div>
          </div>
        </div>
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
          selectedCount={selectedIds.length}
          onAcceptClick={handleAccept}
          onRejectClick={handleReject}
          loading={isAccepting || isRejecting}
        />
      </div>

      <DataTable
        data={filteredApplicants ?? []}
        isLoading={isLoading}
        columns={applicantsTableColumns}
        pagination={pagination}
        paginationOptions={{
          onPaginationChange: setPagination,
          rowCount: filteredApplicants?.length ?? 0,
          pageCount: Math.ceil(
            (filteredApplicants?.length ?? 0) / pagination.pageSize,
          ),
        }}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  )
}
