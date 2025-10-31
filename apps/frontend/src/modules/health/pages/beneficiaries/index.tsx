import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import ActionsButton from './components/actions-button'
import BeneficiaryTable from './components/beneficiary-table'
import SearchBeneficiaryInput from './components/search-beneficiary-input'
import { useRemoveBeneficiary } from './hooks/use-remove-beneficiary'
import { useBeneficiaryTable } from './hooks/use-table'

export default function TableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const {
    mutateAsync: removeBeneficiary,
    isPending: removeBeneficiaryIsPending,
  } = useRemoveBeneficiary()
  const {
    data: beneficiaries,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useBeneficiaryTable()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedBeneficiaries = selectedRows
    .map((rowIndex) => beneficiaries?.[rowIndex])
    .filter((beneficiary): beneficiary is NonNullable<typeof beneficiary> =>
      Boolean(beneficiary),
    )

  const resetSelectedRows = () => setRowSelection({})

  const beneficiaryCount = selectedBeneficiaries.length

  const handleDelete = async () => {
    const allBeneficiaryPromises = selectedBeneficiaries.map((beneficiary) =>
      removeBeneficiary({ userId: beneficiary.id }),
    )

    const results = await Promise.allSettled(allBeneficiaryPromises)
    let totalSuccessful = 0

    for (let i = 0; i < selectedBeneficiaries.length; i++) {
      const removeResult = results[i]

      if (removeResult.status === 'fulfilled') {
        totalSuccessful++
      }
    }

    const totalFailed = selectedBeneficiaries.length - totalSuccessful

    if (totalSuccessful > 0) {
      toast.success(
        `${totalSuccessful} de ${selectedBeneficiaries.length} beneficiario(s) eliminados correctamente.`,
      )
    }

    if (totalFailed > 0) {
      toast.error(
        `Atención: Falló el procesamiento de ${totalFailed} beneficiario(s).`,
      )
    }

    setIsDeleteModalOpen(false)
    resetSelectedRows()
    queryClient.removeQueries({ queryKey: [QueryKeys.HEALTH.BENEFICIARIES] })
  }

  const navigate = useNavigate()

  return (
    <div className="w-full p-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold leading-tight">
          Administración de beneficiarios
        </h2>
        <p className="text-muted-foreground">
          Aquí podrá visualizar todos los beneficiarios registrados.
        </p>
      </header>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="w-full">
          <div className="flex-1 w-full">
            <SearchBeneficiaryInput />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            onEditClick={() =>
              navigate({
                to: '/health/beneficiaries/form',
                search: { id: selectedBeneficiaries[0].id, type: 'edit' },
              })
            }
            selectedCount={beneficiaryCount}
          />
          <Link to="/health/beneficiaries/form" search={{ type: 'new' }}>
            <Button>Nuevo beneficiario</Button>
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <BeneficiaryTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          data={beneficiaries || []}
          columns={columns}
          paginationState={paginationState}
          sortingState={sortingState}
          setFilters={setFilters}
          pagination={pagination}
        />
      </div>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {`¿Seguro que desea eliminar ${beneficiaryCount} beneficiario${beneficiaryCount !== 1 ? 's' : ''}?`}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={removeBeneficiaryIsPending}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
