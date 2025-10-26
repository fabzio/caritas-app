import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { ChevronDown } from 'lucide-react'

type Props = {
  onEditClick: () => void
  selectedCount: number
}

export default function ActionsButton({
  onEditClick,
  selectedCount,
}: Readonly<Props>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Acciones
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={onEditClick}
            disabled={selectedCount !== 1}
          >
            Editar
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
