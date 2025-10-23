import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { MoreVertical } from 'lucide-react'

type Props = {
  scholarshipId: number
  scholarshipName: string
}

export default function ActionsButton({
  scholarshipId,
  scholarshipName,
}: Readonly<Props>) {
  const handleEdit = () => {
    console.log('Edit scholarship:', scholarshipId)
  }

  const handleDelete = () => {
    console.log('Delete scholarship:', scholarshipId, scholarshipName)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
