import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type PaginationOptions,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ReactTableDevtools } from '@tanstack/react-table-devtools'
import { Button } from '@workspace/ui/components/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@workspace/ui/components/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Spinner } from '@workspace/ui/components/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'

type Props<T> = {
  data: T[]
  isLoading?: boolean
  columns: ColumnDef<T>[]
  pagination: PaginationState
  paginationOptions: Pick<
    PaginationOptions,
    'onPaginationChange' | 'rowCount' | 'pageCount'
  >
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  rowSelection?: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  onRowClick?: (row: T) => void
}

export default function DataTable<T>({
  data,
  isLoading = false,
  columns,
  pagination,
  paginationOptions,
  sorting,
  onSortingChange,
  rowSelection,
  setRowSelection,
  showPageSizeSelector = false,
  pageSizeOptions = [5, 10, 20, 30, 50],
  onRowClick,
}: Readonly<Props<T>>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex - 1,
        pageSize: pagination.pageSize,
      },
      sorting,
      rowSelection,
    },
    onSortingChange,
    ...paginationOptions,
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: rowSelection !== undefined,
  })
  const currentPage = table.getState().pagination.pageIndex
  const totalPages = table.getPageCount()

  const paginationNumbers = generatePaginationNumbers(currentPage, totalPages)
  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                onClick={() => onRowClick?.(row.original)}
                className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                {isLoading ? (
                  <div className="w-full flex justify-center">
                    <Spinner />{' '}
                  </div>
                ) : (
                  'No se encontraron resultados'
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-center gap-4 my-4 relative">
        <Pagination className="flex justify-center space-x-2">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="secondary"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
            </PaginationItem>

            {paginationNumbers.map((page) => (
              <PaginationItem key={page.toString()}>
                {page === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <Button
                    variant={+page === currentPage + 1 ? 'outline' : 'ghost'}
                    size="icon"
                    onClick={() => table.setPageIndex(+page - 1)}
                  >
                    {page}
                  </Button>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <Button
                variant="secondary"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {showPageSizeSelector && (
          <div className="lg:absolute lg:right-0 pr-2">
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => {
                const newPageSize = Number(value)
                paginationOptions.onPaginationChange?.((old) => ({
                  ...old,
                  pageSize: newPageSize,
                  pageIndex: 0,
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    Mostrar {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      {import.meta.env.DEV && (
        <ReactTableDevtools initialIsOpen={false} table={table} />
      )}
    </>
  )
}

const generatePaginationNumbers = (currentPage: number, totalPages: number) => {
  const surroundingPageCount = 2
  const finalPageNumbers: (number | string)[] = []
  let previousPage: number | undefined

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    const isPageAtStartOrEnd = pageNumber === 1 || pageNumber === totalPages
    const isPageNearCurrent =
      pageNumber >= currentPage - surroundingPageCount &&
      pageNumber <= currentPage + surroundingPageCount

    if (isPageAtStartOrEnd || isPageNearCurrent) {
      if (previousPage !== undefined) {
        const isThereAGap = pageNumber - previousPage === 2
        const isThereALargerGap = pageNumber - previousPage > 2

        if (isThereAGap) {
          finalPageNumbers.push(previousPage + 1)
        } else if (isThereALargerGap) {
          finalPageNumbers.push('...')
        }
      }

      finalPageNumbers.push(pageNumber)
      previousPage = pageNumber
    }
  }

  return finalPageNumbers
}
