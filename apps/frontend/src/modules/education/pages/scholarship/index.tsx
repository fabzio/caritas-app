import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { PlusCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import ScholarshipTable from './components/scholarship-table'
import { useScholarshipTable } from './hooks/use-table'

export default function ScholarshipPage() {
  const isMobile = useIsMobile()
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')

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
    setFilters,
    isLoading,
    isError,
  } = useScholarshipTable()

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setFilters({ name: value, pageIndex: 1 })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Administración de becas
        </h1>
      </div>
      <div>
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar becas..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Link to="/education/scholarship/create">
            <Button className="w-full sm:w-auto" size={isMobile ? 'sm' : 'lg'}>
              <PlusCircle />
              Registrar nueva beca
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skeletonKeys.map((k) => (
              <Card key={`skeleton-${k}`}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-6" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              <p>Error al cargar las becas. Intente de nuevo.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && scholarships && (
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
    </div>
  )
}
