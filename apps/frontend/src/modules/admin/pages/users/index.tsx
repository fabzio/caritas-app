import authClient from '@frontend/lib/authClient'
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
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import ActionsButton from './components/actions-button'
import RoleFilter from './components/role-filter'
import SearchUserInput from './components/search-user-input'
import UserTable from './components/user-table'
import { useRemoveUser } from './hooks/use-remove-user'
import { useUserTable } from './hooks/use-table'

export default function TableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { mutateAsync: removeUser, isPending: removeUserIsPending } =
    useRemoveUser()
  const {
    data: users,
    pagination,
    columns,
    paginationState,
    sortingState,
    filters,
    setFilters,
  } = useUserTable()

  const roleFilter = filters.role || 'all'

  const handleRoleFilterChange = (newRole: string) => {
    setRowSelection({})
    setFilters({
      role: newRole === 'all' ? undefined : newRole,
      pageIndex: 1,
    })
  }

  const uniqueRoles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'healthMember', label: 'Personal de Salud' },
    { value: 'educationMember', label: 'Personal de Educación' },
  ]

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedUsers = selectedRows
    .map((rowIndex) => users?.[rowIndex])
    .filter((user): user is NonNullable<typeof user> => Boolean(user))

  const resetSelectedRows = () => setRowSelection({})

  const userCount = selectedUsers.length

  const handleDelete = async () => {
    const { data: session } = await authClient.getSession()

    const currentUserId = session?.user?.id

    const isDeletingSelf =
      currentUserId && selectedUsers.some((user) => user.id === currentUserId)

    if (isDeletingSelf) {
      toast.error('No puedes eliminar tu propia cuenta.')
      setIsDeleteModalOpen(false)
      return
    }

    const allUserPromises = selectedUsers.map((user) =>
      removeUser({ userId: user.memberId }),
    )

    const results = await Promise.allSettled(allUserPromises)
    let totalSuccessful = 0

    for (let i = 0; i < selectedUsers.length; i++) {
      const removeResult = results[i]

      if (removeResult.status === 'fulfilled') {
        totalSuccessful++
      }
    }

    const totalFailed = selectedUsers.length - totalSuccessful

    if (totalSuccessful > 0) {
      toast.success(
        `${totalSuccessful} de ${selectedUsers.length} usuario(s) eliminados correctamente.`,
      )
    }

    if (totalFailed > 0) {
      toast.error(
        `Atención: Falló el procesamiento de ${totalFailed} usuario(s).`,
      )
    }

    setIsDeleteModalOpen(false)
    resetSelectedRows()
    queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
  }

  const navigate = useNavigate()

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex-1 w-full">
            <SearchUserInput />
          </div>
          <div className="sm:w-auto w-full">
            <RoleFilter
              value={roleFilter}
              onValueChange={handleRoleFilterChange}
              roles={uniqueRoles}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            onEditClick={() =>
              navigate({
                to: '/admin/users/form',
                search: { id: selectedUsers[0].id, type: 'edit' },
              })
            }
            selectedCount={userCount}
          />
          <Link to="/admin/users/form" search={{ type: 'new' }}>
            <Button>
              <UserPlus />
              Nuevo usuario
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <UserTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          data={users || []}
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
              {`¿Seguro que desea eliminar ${userCount} usuario${userCount !== 1 ? 's' : ''}?`}
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
              disabled={removeUserIsPending}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
