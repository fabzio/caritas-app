import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Member, membersColumns } from '../components/members-columns'

type RowSelectionState = Record<string, boolean>

type MemberColumnId = 'name' | 'email' | 'role' | 'createdAt'

type UseMembersTableResult = {
  data: Member[]
  columns: typeof membersColumns
  pagination: {
    pageIndex: number
    pageSize: number
  }
  paginationOptions: {
    onPaginationChange: OnChangeFn<PaginationState>
    rowCount: number
    pageCount: number
  }
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  rowSelection: RowSelectionState
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>
}

const memberSortAccessors: Record<
  MemberColumnId,
  (member: Member) => string | number
> = {
  name: (member) => member.user?.name ?? '',
  email: (member) => member.user?.email ?? '',
  role: (member) => member.role,
  createdAt: (member) => new Date(member.createdAt).getTime(),
}

const isUpdater = <T>(value: Updater<T>): value is (old: T) => T =>
  typeof value === 'function'

export const useMembersTable = (members: Member[]): UseMembersTableResult => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo(() => membersColumns, [])

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(members.length / pagination.pageSize) - 1,
    )
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }))
      setRowSelection({})
    }
  }, [members.length, pagination.pageIndex, pagination.pageSize])

  const sortedMembers = useMemo(() => {
    if (!sorting.length) return members
    const sort = sorting[0]
    const accessor = memberSortAccessors[sort.id as MemberColumnId]
    if (!accessor) return members
    const nextMembers = [...members]
    nextMembers.sort((a, b) => {
      const aValue = accessor(a)
      const bValue = accessor(b)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.desc ? bValue - aValue : aValue - bValue
      }
      return sort.desc
        ? String(bValue).localeCompare(String(aValue), 'es')
        : String(aValue).localeCompare(String(bValue), 'es')
    })
    return nextMembers
  }, [members, sorting])

  const paginatedMembers = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return sortedMembers.slice(start, end)
  }, [sortedMembers, pagination.pageIndex, pagination.pageSize])

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updateOrValue) => {
      setRowSelection({})
      if (isUpdater(updateOrValue)) {
        setPagination((prev) => updateOrValue(prev))
        return
      }
      setPagination(updateOrValue)
    },
    [],
  )

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updateOrValue) => {
      setRowSelection({})
      if (isUpdater(updateOrValue)) {
        setSorting((prev) => updateOrValue(prev))
        return
      }
      setSorting(updateOrValue)
    },
    [],
  )

  const paginationState = useMemo(
    () => ({
      pageIndex: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize],
  )

  const pageCount = useMemo(
    () => Math.ceil(members.length / pagination.pageSize) || 1,
    [members.length, pagination.pageSize],
  )

  return {
    data: paginatedMembers,
    columns,
    pagination: paginationState,
    paginationOptions: {
      onPaginationChange: handlePaginationChange,
      rowCount: members.length,
      pageCount,
    },
    sorting,
    onSortingChange,
    rowSelection,
    setRowSelection,
  }
}
