import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { ChevronDown } from 'lucide-react'

type Props = {
  onAcceptClick: () => void
  selectedCount: number
  loading?: boolean
}

export default function ActionsButton({
  onAcceptClick,
  selectedCount,
  loading = false,
}: Readonly<Props>) {
  const isDisabled = selectedCount === 0 || loading
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          Acciones
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onAcceptClick} disabled={isDisabled}>
            {loading ? 'Aceptando...' : 'Aceptar'}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Exportar</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>Excel</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
