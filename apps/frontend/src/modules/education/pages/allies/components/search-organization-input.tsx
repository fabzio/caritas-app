import { useFilters } from '@frontend/hooks/use-filters'
import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'

export default function SearchOrganizationInput() {
  const { setFilters } = useFilters('/_authenticated/education/organization/')
  const onChangeFilter = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ q: e.target.value })
  }, 300)

  return (
    <Input
      type="search"
      placeholder="Buscar por nombre de organización..."
      onChange={onChangeFilter}
    />
  )
}
