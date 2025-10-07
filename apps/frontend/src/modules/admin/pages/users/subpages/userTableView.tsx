import authClient from '@frontend/lib/authClient'
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
import { toast } from 'sonner'
import ActionsButton from '../components/actions-button'
import RoleFilter from '../components/role-filter'
import SearchUserInput from '../components/search-user-input'
import UserTable from '../components/user-table'
import { useBanUser } from '../hooks/use-ban-user'
import { useRemoveUser } from '../hooks/use-remove-user'
import { useUserTable } from '../hooks/use-table'

export default function TableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const { mutateAsync: removeUser, isPending: removeUserIsPending } =
    useRemoveUser()
  const { mutateAsync: banUser, isPending: banUserIsPending } = useBanUser()
  const {
    data: users,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useUserTable()

  const uniqueRoles = useMemo(() => {
    if (!users) return []
    const roles = users
      .map((user) => user.role)
      .filter((role): role is string => role !== null && role !== undefined)
    return Array.from(new Set(roles)).sort((a, b) => a.localeCompare(b, 'es'))
  }, [users])

  const filteredUsers = useMemo(() => {
    if (!users || roleFilter === 'all') return users
    return users.filter((user) => user.role === roleFilter)
  }, [users, roleFilter])

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedUsers = selectedRows
    .map((rowIndex) => filteredUsers?.[rowIndex])
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

    const allUserPromises = selectedUsers.flatMap((user) => [
      removeUser({ userId: user.id }),
      banUser({ userId: user.id, banReason: 'User deleted by admin' }),
    ])

    const results = await Promise.allSettled(allUserPromises)

    let totalSuccessful = 0

    for (let i = 0; i < selectedUsers.length; i++) {
      const removeResult = results[i * 2]
      const banResult = results[i * 2 + 1]

      if (
        removeResult.status === 'fulfilled' &&
        banResult.status === 'fulfilled'
      ) {
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
              onValueChange={setRoleFilter}
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
                search: { type: 'edit', id: selectedUsers[0].id },
              })
            }
            selectedCount={userCount}
          />
          <Link to={'/admin/users/form'} search={{ type: 'new' }}>
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
          data={filteredUsers || []}
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
              disabled={removeUserIsPending || banUserIsPending}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
