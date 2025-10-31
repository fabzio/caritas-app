import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useCreateAlly } from '../pages/allies/hooks/use-create-ally'
import useUpdateAlly from '../pages/allies/hooks/use-update-ally'
import {
  type Ally,
  type FormAllySchema,
  formAllySchema,
} from '../pages/allies/models/ally'

const isAlly = (candidate: unknown): candidate is Ally => {
  if (!candidate || typeof candidate !== 'object') return false
  const value = candidate as Record<string, unknown>
  return typeof value.id === 'string' && typeof value.name === 'string'
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ally?: Ally | null
  onCompleted?: (params: { action: 'create' | 'update'; ally: Ally }) => void
  type?: 'health' | 'education'
}

export default function OrganizationFormDialog({
  open,
  onOpenChange,
  ally,
  onCompleted,
  type = 'health',
}: Readonly<Props>) {
  const form = useForm<FormAllySchema>({
    resolver: zodResolver(formAllySchema),
    defaultValues: { name: '' },
  })

  const { mutateAsync: createAlly, isPending: isCreating } = useCreateAlly({
    type,
  })
  const { mutateAsync: updateAlly, isPending: isUpdating } = useUpdateAlly()

  const isEditMode = Boolean(ally?.id)
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (open) {
      form.reset({ name: ally?.name ?? '' })
    }
  }, [open, ally, form])

  const handleDialogChange = (flag: boolean) => {
    if (!flag) {
      form.reset({ name: '' })
    }
    onOpenChange(flag)
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditMode && ally?.id) {
        const updated = await updateAlly({
          id: ally.id,
          name: values.name,
        })
        const payload = isAlly(updated)
          ? updated
          : { ...ally, name: values.name }
        onCompleted?.({ action: 'update', ally: payload })
      } else {
        const created = await createAlly({
          name: values.name,
        })
        if (isAlly(created)) {
          onCompleted?.({ action: 'create', ally: created })
        }
      }
      handleDialogChange(false)
    } catch (rawError) {
      const error = rawError as { status?: number; message?: string }
      if (error?.status === 400) {
        form.setError('name', {
          type: 'manual',
          message: error.message || 'La Organización ya existe',
        })
        return
      }
      if (isEditMode) {
        toast.error(error?.message || 'Ocurrió un error al actualizar')
      }
    }
  })

  const title = isEditMode
    ? 'Editar Organización'
    : 'Registrar Nueva Organización'
  const description = isEditMode
    ? 'Actualiza el nombre de la Organización'
    : 'Complete la información de la Organización'
  const submitLabel = isEditMode ? 'Guardar Cambios' : 'Registrar'

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Organización</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-4 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  submitLabel
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
