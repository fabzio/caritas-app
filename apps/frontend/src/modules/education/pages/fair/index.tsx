import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import FairTable from './components/fair-table'
import SearchFairInput from './components/search-fair-input'
import { useFairTable } from './hooks/use-fair-table'

export default function FairPage() {
  const isMobile = useIsMobile()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()

  const {
    data: fairs,
    isLoading,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useFairTable()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedFairs = selectedRows
    .map((rowIndex) => fairs?.[rowIndex])
    .filter(Boolean)

  const fairCount = selectedFairs.length

  return (
    <div className="w-full p-4">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Gestión de Ferias Vocacionales
        </h1>
      </div>

      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex-1 w-full">
            <SearchFairInput />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => {}}
            onEditClick={() =>
              navigate({
                to: '/education/fair/form',
                search: { id: selectedFairs[0].id, type: 'edit' },
              })
            }
            selectedCount={fairCount}
          />
          <Link search={{ type: 'new' }} to="/education/fair/form">
            <Button size={isMobile ? 'sm' : 'default'}>
              <PlusCircle />
              {!isMobile && 'Nueva feria'}
            </Button>
          </Link>
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
