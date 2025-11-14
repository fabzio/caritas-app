import { useIsMobile } from '@frontend/hooks/use-mobile'
import { useSession } from '@frontend/hooks/use-session'
import SelectFilters from '@frontend/modules/education/pages/scholarship-recipients/components/select-filters'
import { Link } from '@tanstack/react-router'
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
import { ChevronDown, FilePlus2 } from 'lucide-react'
import { useState } from 'react'
import ScholarshipTable from '../components/scholarship-table'
import { useScholarshipTable } from '../hooks/use-table'
export default function ScholarshipPage() {
  const isMobile = useIsMobile()
  const { data: session } = useSession()
  const organizationId = session?.session.activeOrganizationId
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [openReport, setOpenReport] = useState(false)
  const handleCreateReport = () => setOpenReport(true)
  const {
    data: scholarships,
    pagination,
    columns,
    paginationState,
    sortingState,
    filters,
    setFilters,
    isError,
  } = useScholarshipTable(organizationId)

  const selectedCount = Object.keys(rowSelection).length
  const canEdit = selectedCount === 1

  const handleSearchChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ name: e.target.value })
    },
    300,
  )
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size={isMobile ? 'sm' : 'lg'}>
                Acciones
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleCreateReport}
                disabled={selectedCount === 0}
              >
                <Link
                  to="/organization/education/scholarship/report"
                  search={{
                    type: 'new',
                    id:
                      rowSelection && scholarships
                        ? scholarships[Number(Object.keys(rowSelection)[0])]?.id
                        : undefined,
                  }}
                >
                  <FilePlus2 className="h-4 w-4 mr-2" />
                  Crear reporte
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
