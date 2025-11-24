import { Skeleton } from '@workspace/ui/components/skeleton'
import FairTable from './components/fair-table'
import { useFairTable } from './hooks/use-fair-table'

export default function FairPage() {
  const {
    data: fairs,
    isLoading,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useFairTable()

  return (
    <div className="w-full p-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold leading-tight">
          Ferias Vocacionales
        </h2>
        <p className="text-muted-foreground">
          Aquí podrá visualizar todas las ferias vocacionales registradas.
        </p>
      </header>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <FairTable
            data={fairs || []}
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
