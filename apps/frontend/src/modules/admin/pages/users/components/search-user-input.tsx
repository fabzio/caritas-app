import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'
import { useFilters } from '@/hooks/use-filters'

export default function SearchUserInput() {
  const { setFilters } = useFilters('/_authenticated/admin/users')
  const onChangeFilter = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ q: e.target.value })
  }, 300)

  return (
    <Input
      type="search"
      placeholder="Buscar por nombre o documento..."
      className="w-full md:w-2/4"
      onChange={onChangeFilter}
    />
  )
}
