import { useFilters } from '@frontend/hooks/use-filters'
import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'

export default function SearchSpecialityInput() {
  const { setFilters } = useFilters('/_authenticated/health/specialities/')
  const onChangeFilter = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ q: e.target.value })
  }, 300)

  return (
    <Input
      type="search"
      placeholder="Buscar por nombre..."
      onChange={onChangeFilter}
    />
  )
}
