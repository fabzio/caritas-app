import { useFilters } from '@frontend/hooks/use-filters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

export default function HistorySelector() {
  const { filters, setFilters } = useFilters(
    '/_authenticated/user/health/activities/',
  )
  const handleChange = (
    val: 'participated' | 'notParticipated' | 'canceled',
  ) => {
    setFilters({ view: val })
  }
  return (
    <Select
      key={filters.view}
      defaultValue={filters.view}
      onValueChange={handleChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona el filtro" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="participated">Participadas</SelectItem>
        <SelectItem value="notParticipated">No participadas</SelectItem>
        <SelectItem value="canceled">Canceladas</SelectItem>
      </SelectContent>
    </Select>
  )
}
