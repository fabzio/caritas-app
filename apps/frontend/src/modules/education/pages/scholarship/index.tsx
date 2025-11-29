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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import debounce from 'debounce'
import { ChevronDown, Filter, PlusCircle, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useListOrganizations } from '../allies/hooks/use-list-organizations'
import DeleteConfirmationDialog from './components/delete-confirmation-dialog'
import ScholarshipTable from './components/scholarship-table'
import { useScholarshipTable } from './hooks/use-table'
export default function ScholarshipPage() {
  const isMobile = useIsMobile()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
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

  const { data: organizationsResponse } = useListOrganizations({
    currentPage: 1,
    pageSize: 100,
  })
  const organizations = organizationsResponse?.data || []

  const handleSearchChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ name: e.target.value })
    },
    300,
  )

  const selectedCount = Object.keys(rowSelection).length
  const canEdit = selectedCount === 1
  const canDelete = selectedCount > 0

  const hasActiveFilters = filters.organizationId !== undefined

  const clearFilters = () => {
    setFilters({ organizationId: undefined, pageIndex: 1 })
  }

  const handleEdit = () => {
    const selectedIds = Object.keys(rowSelection)
    if (selectedIds.length === 1 && scholarships) {
      const selectedScholarship =
        scholarships[Number.parseInt(selectedIds[0], 10)]
      const start = new Date(selectedScholarship.startDate)
      const now = new Date()
      const startDateOnly = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      )
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const expired = startDateOnly <= today
      if (expired) {
        toast.error('No puede editar una beca cuya inscripcion ya ha iniciado')
        return
      }
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
          <div className="flex gap-2 items-center">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="default" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="ml-1 rounded-full bg-primary-foreground text-primary px-2 py-0.5 text-xs font-semibold">
                      1
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filtros</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Organización</span>
                      <Select
                        value={filters.organizationId || 'all'}
                        onValueChange={(value) =>
                          setFilters({
                            organizationId: value === 'all' ? undefined : value,
                            pageIndex: 1,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las organizaciones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las organizaciones
                          </SelectItem>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
                <DropdownMenuItem onClick={handleDelete} disabled={!canDelete}>
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
