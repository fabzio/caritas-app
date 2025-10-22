import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { ChevronDown } from 'lucide-react'

type Props = {
  onDeleteClick: () => void
  onEditClick: () => void
  selectedCount: number
}

export default function ActionsButton({
  onDeleteClick,
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
            onClick={onDeleteClick}
            disabled={selectedCount === 0}
          >
            Eliminar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onEditClick}
            disabled={selectedCount !== 1}
          >
            Editar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
