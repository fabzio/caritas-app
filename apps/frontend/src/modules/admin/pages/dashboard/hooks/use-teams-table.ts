import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Team, teamColumns } from '../components/team-columns'

type RowSelectionState = Record<string, boolean>

type TeamColumnId = 'name' | 'createdAt' | 'updatedAt'

type UseTeamsTableResult = {
  data: Team[]
  columns: typeof teamColumns
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

const teamSortAccessors: Record<TeamColumnId, (team: Team) => string | number> =
  {
    name: (team) => team.name,
    createdAt: (team) => new Date(team.createdAt).getTime(),
    updatedAt: (team) => new Date(team.updatedAt ?? team.createdAt).getTime(),
  }

const isUpdater = <T>(value: Updater<T>): value is (old: T) => T =>
  typeof value === 'function'

export const useTeamsTable = (teams: Team[]): UseTeamsTableResult => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo(() => teamColumns, [])

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(teams.length / pagination.pageSize) - 1,
    )
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }))
      setRowSelection({})
    }
  }, [teams.length, pagination.pageIndex, pagination.pageSize])

  const sortedTeams = useMemo(() => {
    if (!sorting.length) return teams
    const sort = sorting[0]
    const accessor = teamSortAccessors[sort.id as TeamColumnId]
    if (!accessor) return teams
    const nextTeams = [...teams]
    nextTeams.sort((a, b) => {
      const aValue = accessor(a)
      const bValue = accessor(b)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.desc ? bValue - aValue : aValue - bValue
      }
      return sort.desc
        ? String(bValue).localeCompare(String(aValue), 'es')
        : String(aValue).localeCompare(String(bValue), 'es')
    })
    return nextTeams
  }, [teams, sorting])

  const paginatedTeams = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return sortedTeams.slice(start, end)
  }, [sortedTeams, pagination.pageIndex, pagination.pageSize])

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
    () => Math.ceil(teams.length / pagination.pageSize) || 1,
    [teams.length, pagination.pageSize],
  )

  return {
    data: paginatedTeams,
    columns,
    pagination: paginationState,
    paginationOptions: {
      onPaginationChange: handlePaginationChange,
      rowCount: teams.length,
      pageCount,
    },
    sorting,
    onSortingChange,
    rowSelection,
    setRowSelection,
  }
}
