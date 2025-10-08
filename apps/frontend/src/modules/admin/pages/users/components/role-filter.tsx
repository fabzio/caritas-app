import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

interface RoleFilterProps {
  value: string
  onValueChange: (value: string) => void
  roles: string[]
}

export default function RoleFilter({
  value,
  onValueChange,
  roles,
}: Readonly<RoleFilterProps>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Filtrar por rol" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los roles</SelectItem>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
