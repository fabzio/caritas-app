import ActionsButton from '@frontend/modules/admin/pages/users/components/actions-button'
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
import { UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import OrganizationTable from './components/organization-table'
import SearchHealthOrganizationInput from './components/search-organization-input'
import { useOrganizationTable } from './hooks/use-organization-table'
// import { useRemoveUser } from '../users/hooks/use-remove-user'

export default function AlliesTableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState<string>('')
  // const { mutateAsync: removeUser, isPending: removeUserIsPending } =
  //   useRemoveUser()
  const {
    data: allies,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useOrganizationTable()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedAllies = selectedRows
    .map((rowIndex) => allies?.[rowIndex])
    .filter((ally): ally is NonNullable<typeof ally> => Boolean(ally))

  const resetSelectedRows = () => setRowSelection({})

  const userCount = selectedAllies.length

  const handleDelete = async () => {
    // const { data: session } = await authClient.getSession()
    // const allUserPromises = selectedUsers.flatMap((ally) => [
    //   removeUser({ userId: ally.id }),
    //   banUser({ userId: ally.id, banReason: 'User deleted by admin' }),
    // ])
    // const results = await Promise.allSettled(allUserPromises)
    // let totalSuccessful = 0
    // for (let i = 0; i < selectedUsers.length; i++) {
    //   const removeResult = results[i * 2]
    //   const banResult = results[i * 2 + 1]
    //   if (
    //     removeResult.status === 'fulfilled' &&
    //     banResult.status === 'fulfilled'
    //   ) {
    //     totalSuccessful++
    //   }
    // }
    // const totalFailed = selectedUsers.length - totalSuccessful
    // if (totalSuccessful > 0) {
    //   toast.success(
    //     `${totalSuccessful} de ${selectedUsers.length} usuario(s) eliminados correctamente.`,
    //   )
    // }
    // if (totalFailed > 0) {
    //   toast.error(
    //     `Atención: Falló el procesamiento de ${totalFailed} usuario(s).`,
    //   )
    // }
    // setIsDeleteModalOpen(false)
    // resetSelectedRows()
  }

  const navigate = useNavigate()

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex-1 w-full">
            <SearchHealthOrganizationInput />
          </div>
          {/* <div className="sm:w-auto w-full">
            <RoleFilter
              value={nameFilter}
              onValueChange={setNameFilter}
              roles={uniqueRoles}
            />
          </div> */}
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            onEditClick={
              () => {}
              // navigate({
              //   to: '/admin/allies/form',
              //   search: { type: 'edit', id: selectedUsers[0].id },
              // })
            }
            selectedCount={userCount}
          />
          {/* <Link to={'/admin/allies/form'} search={{ type: 'new' }}>
            <Button>
              <UserPlus />
              Nuevo usuario
            </Button>
          </Link> */}
        </div>
      </div>
      <div className="mt-4">
        <OrganizationTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          data={allies || []}
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
              {`¿Seguro que desea eliminar ${userCount} organizaci${userCount !== 1 ? 'ones' : 'ón'}?`}
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
              // disabled={removeUserIsPending}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
