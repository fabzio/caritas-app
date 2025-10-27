import { useFilters } from '@frontend/hooks/use-filters'
import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'
import type React from 'react'

export default function SearchActivityInput() {
  const { setFilters } = useFilters('/_authenticated/health/activities/')

  const onChangeFilter = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ q: e.target.value })
  }, 300)

  return (
    <Input
      type="search"
      placeholder="Buscar por nombre de actividad..."
      onChange={onChangeFilter}
    />
  )
}
