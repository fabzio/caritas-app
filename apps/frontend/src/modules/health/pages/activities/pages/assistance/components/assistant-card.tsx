import { getRouteApi, Link } from '@tanstack/react-router'
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
import AssistantOptions from './assistant-options'

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
  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onClick?.(assistant)}
      >
        <CardContent className="p-4">
          <div className="flex flex-row justify-between items-center">
            <div className="space-y-1">
              <p className="font-medium text-lg">{assistant.name}</p>
              <p className="text-sm text-muted-foreground">
                {assistant.documentType}: {assistant.documentNumber}
              </p>
            </div>
            <div>
              <AssistantOptions
                onDeleteClick={() => setIsDeleteModalOpen(true)}
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
