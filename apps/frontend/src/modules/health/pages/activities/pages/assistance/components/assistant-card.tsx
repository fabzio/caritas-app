import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useState } from 'react'
import { useRemoveAttendant } from '../hooks/use-remove-attendant'
import AssistantOptionsButtons from './assistant-options-buttons'

export interface Assistant {
  id: string
  name: string
  documentType: string
  documentNumber: string
}

interface AssistantCardProps {
  assistant: Assistant
  onClick?: (assistant: Assistant) => void
}

export default function AssistantCard({
  assistant,
  onClick,
}: Readonly<AssistantCardProps>) {
  const loaderData = getRouteApi(
    '/_authenticated/health/activities/$activityId/assistance',
  ).useLoaderData()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { mutateAsync: removeAttendant, isPending: removeAttendantIsPending } =
    useRemoveAttendant()

  const handleDelete = async () => {
    removeAttendant({ userId: assistant.id, activityId: loaderData.id })
    setIsDeleteModalOpen(false)
  }

  const navigate = useNavigate()
  const handleEdit = () => {
    navigate({
      to: '/health/activities/$activityId/form',
      params: {
        activityId: loaderData.id.toString(),
      },
      search: { id: assistant.id, type: 'edit' },
    })
  }
  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onClick?.(assistant)}
      >
        <CardContent className="px-4 py-0">
          <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center md:gap-2">
            <div className="space-y-1">
              <p className="font-medium text-lg">{assistant.name}</p>
              <p className="text-sm text-muted-foreground">
                {assistant.documentType}: {assistant.documentNumber}
              </p>
            </div>
            <div>
              <AssistantOptionsButtons
                onDeleteClick={() => setIsDeleteModalOpen(true)}
                onEditClick={handleEdit}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {`¿Seguro que desea eliminar al asistente ${assistant.name} de esta actividad?`}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={removeAttendantIsPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
