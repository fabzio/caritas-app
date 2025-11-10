import { useIsMobile } from '@frontend/hooks/use-mobile'
import ScholarshipTable from '@frontend/modules/education/pages/scholarship/components/scholarship-table'
import SelectFilters from '@frontend/modules/education/pages/scholarship-recipients/components/select-filters'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'
import { useState } from 'react'
import { useScholarshipTable } from '../hooks/use-table'

export default function ScholarshipPage() {
  const isMobile = useIsMobile()
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
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <header className="mb-6">
          <h2 className="text-2xl font-bold leading-tight">Mis Becas</h2>
          <p className="text-muted-foreground">
            Aquí podrá visualizar todas las becas registradas en tu
            organización.
          </p>
        </header>
      </div>

      <div>
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar becas..."
              onChange={handleSearchChange}
            />
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
    </div>
  )
}
