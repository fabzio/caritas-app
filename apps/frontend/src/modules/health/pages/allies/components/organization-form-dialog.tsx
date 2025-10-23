import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
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
import { useCreateAlly } from '../hooks/use-create-ally'
import useGetAlly from '../hooks/use-get-ally'
import useUpdateAlly from '../hooks/use-update-ally'
import { type FormAllySchema, formAllySchema } from '../models/ally'

type Props = {
  open: boolean
  onOpenChange: (params: { open: boolean; type: 'new' | 'edit' }) => void
  initialData?: { id?: string }
}

export default function OrganizationFormDialog({
  open,
  onOpenChange,
  initialData,
}: Readonly<Props>) {
  const viewType = initialData?.id ? 'edit' : 'new'
  const { data: user } = useSession()

  const { data: allyData, isFetching } = useGetAlly(initialData?.id)
  const { mutate: create, isPending: isCreating } = useCreateAlly()
  const { mutate: update, isPending: isUpdating } = useUpdateAlly()

  const form = useForm<FormAllySchema>({
    resolver: zodResolver(formAllySchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (allyData) {
      form.reset({ name: allyData.name })
    } else if (!initialData?.id) {
      form.reset({ name: '' })
    }
  }, [allyData, initialData, form])

  useEffect(() => {
    if (!open) form.reset({ name: '' })
  }, [open, form])

  const handleSubmit = form.handleSubmit((data) => {
    if (!user) return

    if (viewType === 'edit' && initialData?.id) {
      update(
        { id: initialData.id, name: data.name },
        {
          onSuccess: () => {
            onOpenChange({ open: false, type: 'new' })
          },
          onError: (error) => {
            const err = error as { status?: number; message?: string }
            toast.error(err.message || 'Ocurrió un error al actualizar')
          },
        },
      )
    } else {
      create(data, {
        onSuccess: () => {
          onOpenChange({ open: false, type: 'new' })
        },
        onError: (error) => {
          const err = error as { status?: number; message?: string }
          if (err.status === 400) {
            form.setError('name', {
              type: 'manual',
              message: err.message || 'La Organización ya existe',
            })
          } else {
            toast.error(err.message || 'Ocurrió un error')
          }
        },
      })
    }
  })

  const submitLabel = viewType === 'edit' ? 'Guardar Cambios' : 'Registrar'
  const isLoading = isCreating || isUpdating || isFetching

  return (
    <Dialog
      open={open}
      onOpenChange={(flag) => onOpenChange({ open: flag, type: 'new' })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {viewType === 'edit'
              ? 'Editar Organización'
              : 'Registrar Nueva Organización'}
          </DialogTitle>
          <DialogDescription>
            {viewType === 'edit'
              ? 'Actualiza el nombre de la Organización'
              : 'Complete la información de la Organización'}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Organización</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange({ open: false, type: 'new' })}
                >
                  Cancelar
                </Button>
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
        )}
      </DialogContent>
    </Dialog>
  )
}
