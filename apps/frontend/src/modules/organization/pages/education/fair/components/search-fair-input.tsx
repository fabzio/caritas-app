import { useFilters } from '@frontend/hooks/use-filters'
import { Input } from '@workspace/ui/components/input'

export default function SearchFairInput() {
  const { filters, setFilters } = useFilters(
    '/_authenticated/organization/education/fair/',
  )

  const handleSearchChange = (value: string) => {
    setFilters({
      q: value || undefined,
      pageIndex: 1,
    })
  }

  return (
    <div className="relative flex-1">
      <Input
        type="search"
        placeholder="Buscar ferias vocacionales..."
        value={filters.q || ''}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
    </div>
  )
}
