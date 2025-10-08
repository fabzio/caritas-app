import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

interface SelectFiltersProps {
  value: string
  onValueChange: (value: string) => void
  valueList: string[]
  item: string
}

export default function SelectFilters({
  value,
  onValueChange,
  valueList,
  item,
}: Readonly<SelectFiltersProps>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={`Filtrar por ${item}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{`Todos lo/as ${item}`}</SelectItem>
        {valueList.map((valueItem) => (
          <SelectItem key={valueItem} value={valueItem}>
            {valueItem}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
