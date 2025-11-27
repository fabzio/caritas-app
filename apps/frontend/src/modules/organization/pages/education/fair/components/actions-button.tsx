import { useIsMobile } from '@frontend/hooks/use-mobile'
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
  onManageAttendanceClick: () => void
  selectedCount: number
}

export default function ActionsButton({
  onManageAttendanceClick,
  selectedCount,
}: Readonly<Props>) {
  const isMobile = useIsMobile()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={isMobile ? 'w-full' : ''}>
          Acciones
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={onManageAttendanceClick}
            disabled={selectedCount !== 1}
          >
            Registrar/Editar Asistencias
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
