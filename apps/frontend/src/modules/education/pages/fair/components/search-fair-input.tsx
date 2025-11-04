import { useFilters } from '@frontend/hooks/use-filters'
import { Input } from '@workspace/ui/components/input'

export default function SearchFairInput() {
  const { filters, setFilters } = useFilters('/_authenticated/education/fair/')

  const handleSearchChange = (value: string) => {
    setFilters({
      q: value || undefined,
      pageIndex: 1,
    })
  }

  return (
    <div className="relative flex-1">
      {/* <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
      <Input
        type="search"
        placeholder="Buscar ferias vocacionales..."
        // className="pl-9"
        value={filters.q || ''}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
    </div>
  )
}
