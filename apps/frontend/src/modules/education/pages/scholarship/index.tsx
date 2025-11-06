import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'
import { ChevronDown, MoreVertical, PlusCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import DeleteConfirmationDialog from './components/delete-confirmation-dialog'
import ScholarshipTable from './components/scholarship-table'
import { useScholarshipTable } from './hooks/use-table'
export default function ScholarshipPage() {
  const isMobile = useIsMobile()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)
  const navigate = useNavigate()
  const clearSelection = () => setRowSelection({})
  const skeletonKeys = useMemo(
    () =>
      Array.from(
        { length: 6 },
        () =>
          globalThis.crypto?.randomUUID?.() ??
          Math.random().toString(36).slice(2),
      ),
    [],
  )

  const {
    data: scholarships,
    pagination,
    columns,
    paginationState,
    sortingState,
    filters,
    setFilters,
    isError,
  } = useScholarshipTable()

  const handleSearchChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ name: e.target.value })
    },
    300,
  )

  const selectedCount = Object.keys(rowSelection).length
  const canEdit = selectedCount === 1
  const canDelete = selectedCount > 0

  const handleEdit = () => {
    const selectedIds = Object.keys(rowSelection)
    if (selectedIds.length === 1 && scholarships) {
      const selectedScholarship =
        scholarships[Number.parseInt(selectedIds[0], 10)]
      navigate({
        to: '/education/scholarship/form',
        search: {
          type: 'edit',
          id: selectedScholarship.id,
        },
      })
    }
  }
  const selectedScholarshipIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => {
      const rowIndex = Number.parseInt(key, 10)
      return scholarships![rowIndex].id
    })

  const handleDelete = () => {
    setDeleteOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <header className="mb-6">
          <h2 className="text-2xl font-bold leading-tight">
            Administración de becas
          </h2>
          <p className="text-muted-foreground">
            Aquí podrá visualizar todas las becas registradas.
          </p>
        </header>
      </div>
      <div>
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
            <Input
              placeholder="Buscar becas..."
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size={isMobile ? 'sm' : 'lg'}>
                  {filters.active === undefined
                    ? 'Todas'
                    : filters.active
                      ? 'Activas'
                      : 'Inactivas'}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setFilters({ active: undefined })}
                >
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ active: true })}>
                  Activas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ active: false })}>
                  Inactivas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size={isMobile ? 'sm' : 'lg'}
                  disabled={selectedCount === 0}
                >
                  Acciones
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit} disabled={!canEdit}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={!canDelete}
                  className="text-destructive"
                >
                  Eliminar {selectedCount > 1 ? `(${selectedCount})` : ''}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to="/education/scholarship/form"
              search={{
                type: 'new',
              }}
            >
              <Button
                className="w-full sm:w-auto"
                size={isMobile ? 'sm' : 'lg'}
              >
                <PlusCircle />
                Nueva beca
              </Button>
            </Link>
          </div>
        </div>

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              <p>Error al cargar las becas. Intente de nuevo.</p>
            </CardContent>
          </Card>
        )}

        {!isError && scholarships && (
          <ScholarshipTable
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            data={scholarships}
            columns={columns}
            paginationState={paginationState}
            sortingState={sortingState}
            setFilters={setFilters}
            pagination={pagination}
          />
        )}
      </div>
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={selectedCount}
        ids={selectedScholarshipIds}
        clearSelection={clearSelection}
      />
    </div>
  )
}
