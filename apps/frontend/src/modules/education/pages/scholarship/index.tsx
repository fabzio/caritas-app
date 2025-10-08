import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Filter, PlusCircle, Search } from 'lucide-react'
import useGetScholarship from '../../hooks/use-get-scholarship'
import useScholarshipTable from '../../hooks/use-scholarship-table'
import ScholarshipTable from './components/scholarship-table'

export default function ScholarshipPage() {
  const isMobile = useIsMobile()
  const {
    nameFilter,
    setNameFilter,
    currentPage,
    pagination,
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
    handlePaginationChange,
    pageSize,
  } = useScholarshipTable()

  const { data, isLoading, isError } = useGetScholarship(
    nameFilter,
    currentPage,
    pageSize,
  )

  const scholarships = data?.data || []

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Administración de becas
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        {/* Barra de búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar becas..."
            className="pl-9"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>

        {/* Botones - En mobile divididos 50/50, en desktop juntos */}
        <div className="flex gap-3 md:gap-3">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Link
            to="/education/scholarship/create"
            className="flex-1 md:flex-none"
          >
            <Button
              className="gap-2 w-full md:w-auto"
              size={isMobile ? 'sm' : 'default'}
            >
              <PlusCircle className="w-4 h-4" />
              Registrar nueva beca
            </Button>
          </Link>
        </div>
      </div>

      <div>
        {isLoading && (
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              <p>Error al cargar las becas. Intente de nuevo.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && scholarships && scholarships.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p>No hay becas registradas aún.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && scholarships && scholarships.length > 0 && (
          <ScholarshipTable
            scholarships={scholarships}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            sorting={sorting}
            onSortingChange={setSorting}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            totalCount={data?.total ?? 0}
            pageCount={data?.pageCount ?? 1}
          />
        )}
      </div>
    </div>
  )
}
