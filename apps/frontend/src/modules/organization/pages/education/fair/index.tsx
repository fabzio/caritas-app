import { useIsMobile } from '@frontend/hooks/use-mobile'
import { useNavigate } from '@tanstack/react-router'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import FairTable from './components/fair-table'
import RegionFilter from './components/region-filter'
import SearchFairInput from './components/search-fair-input'
import StatusFilter from './components/status-filter'
import { useFairTable } from './hooks/use-fair-table'

export default function FairPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const {
    data: fairs,
    isLoading,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useFairTable()

  return (
    <div className="w-full p-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold leading-tight">
          Ferias Vocacionales
        </h2>
        <p className="text-muted-foreground">
          Aquí podrá visualizar todas las ferias vocacionales registradas.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex-1 w-full">
            <SearchFairInput />
          </div>
          <div className={`flex ${isMobile ? 'w-full' : 'w-auto'} gap-2`}>
            <RegionFilter />
            <StatusFilter />
            <ActionsButton
              onManageAttendanceClick={() => {
                const selectedIds = Object.keys(rowSelection)
                  .filter((key) => rowSelection[key])
                  .map((key) => Number(key))
                if (selectedIds.length === 1 && fairs) {
                  const fairId = fairs[selectedIds[0]].id
                  navigate({
                    to: '/organization/education/fair/$id/attendance',
                    params: { id: String(fairId) },
                  })
                }
              }}
              selectedCount={Object.values(rowSelection).filter(Boolean).length}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <FairTable
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            data={fairs || []}
            columns={columns}
            paginationState={paginationState}
            sortingState={sortingState}
            setFilters={setFilters}
            pagination={pagination}
          />
        )}
      </div>
    </div>
  )
}
