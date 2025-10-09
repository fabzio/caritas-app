import type { PaginationState, SortingState } from '@tanstack/react-table'
import { useState } from 'react'

export default function useScholarshipTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [nameFilter, setNameFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const pageSize = 10
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: currentPage,
    pageSize: pageSize,
  })

  const handlePaginationChange = (p: PaginationState) => {
    setPagination(p)
    setCurrentPage(p.pageIndex)
  }

  const selectAllRows = (scholarships: Array<{ id: string }>) => {
    const all: Record<string, boolean> = {}
    for (const r of scholarships) {
      all[r.id] = true
    }
    setRowSelection(all)
  }

  const clearSelection = () => {
    setRowSelection({})
  }

  const isAllSelected = (scholarships: Array<{ id: string }>) => {
    return (
      Object.keys(rowSelection).length === scholarships.length &&
      scholarships.length > 0
    )
  }

  return {
    currentPage,
    nameFilter,
    setNameFilter,
    pagination,
    setPagination,
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
    pageSize,
    handlePaginationChange,
    selectAllRows,
    clearSelection,
    isAllSelected,
  }
}
