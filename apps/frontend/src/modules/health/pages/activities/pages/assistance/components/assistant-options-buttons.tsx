import { Button } from '@workspace/ui/components/button'
import { Eye, Pencil, Trash } from 'lucide-react'

type Props = {
  onDeleteClick: () => void
  onEditClick: () => void
}

export default function AssistantOptionsButtons({
  onDeleteClick,
  onEditClick,
}: Readonly<Props>) {
  return (
    <div className="flex flex-row">
      <Button variant="outline" size="icon" className="rounded-full mr-5">
        <Eye />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full mr-5"
        onClick={(e) => {
          e.stopPropagation()
          onEditClick()
        }}
      >
        <Pencil />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full mr-5"
        onClick={(e) => {
          e.stopPropagation()
          onDeleteClick()
        }}
      >
        <Trash />
      </Button>
    </div>
  )
}
