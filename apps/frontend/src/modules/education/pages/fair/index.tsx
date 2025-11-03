import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import ActionsButton from './components/actions-button'
import DeleteConfirmationDialog from './components/delete-fair-dialog.tsx'
import FairTable from './components/fair-table'
import SearchFairInput from './components/search-fair-input'
import { useFairTable } from './hooks/use-fair-table'

export default function FairPage() {
  const isMobile = useIsMobile()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
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
    .filter(
      (fair): fair is NonNullable<typeof fair> =>
        fair !== undefined && fair !== null,
    )

  const fairCount = selectedFairs.length
  const resetSelectedRows = () => setRowSelection({})

  const handleEdit = () => {
    const targetFair = selectedFairs[0]
    if (!targetFair) return
    navigate({
      to: '/education/fair/form',
      search: { id: targetFair.id, type: 'edit' },
    })
  }

  return (
    <div className="w-full p-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold leading-tight">
          Administración de Ferias Vocacionales
        </h2>
        <p className="text-muted-foreground">
          Aquí podrá visualizar todas las ferias vocacionales registradas.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="w-full">
          <div className="flex-1 w-full">
            <SearchFairInput />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            onEditClick={handleEdit}
            selectedCount={fairCount}
          />
          <Link search={{ type: 'new' }} to="/education/fair/form">
            <Button size={'default'}>
              <PlusCircle />
              {'Nueva feria'}
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
      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        selectedCount={fairCount}
        ids={selectedFairs.map((fair) => fair.id)}
        clearSelection={resetSelectedRows}
      />
    </div>
  )
}
