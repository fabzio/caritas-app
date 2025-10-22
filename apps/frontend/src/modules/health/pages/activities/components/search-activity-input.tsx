import { useFilters } from '@frontend/hooks/use-filters'
import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'
import { useMemo } from 'react'

export default function SearchActivityInput() {
  const { setFilters } = useFilters('/_authenticated/health/activities/')
  const onChangeFilter = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ q: e.target.value })
      }, 300),
    [setFilters],
  )

  return (
    <Input
      type="search"
      placeholder="Buscar por nombre de actividad..."
      onChange={onChangeFilter}
    />
  )
}
