import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
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
import { useState } from 'react'

type Props = {
  onDeleteClick: () => void
  onEditClick: () => void
  onExportCsvClick: () => void
  onExportXlsxClick: () => void
  selectedCount: number
}

export default function ActionsButton({
  onDeleteClick,
  onEditClick,
  onExportCsvClick,
  onExportXlsxClick,
  selectedCount,
}: Readonly<Props>) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md h-10 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedCount === 0}
        >
          Acciones
          <ChevronDown className="h-4 w-4" />
        </button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onDeleteClick()
                setOpen(false)
              }}
              disabled={selectedCount === 0}
            >
              Eliminar
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onEditClick()
                setOpen(false)
              }}
              disabled={selectedCount !== 1}
            >
              Editar
            </Button>
            <div className="space-y-2 border-t pt-2">
              <p className="text-sm font-medium text-muted-foreground">
                Exportar
              </p>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onExportCsvClick()
                  setOpen(false)
                }}
              >
                Exportar como CSV
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onExportXlsxClick()
                  setOpen(false)
                }}
              >
                Exportar como Excel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={selectedCount === 0}>
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Exportar</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={onExportCsvClick}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportXlsxClick}>
                Excel
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
