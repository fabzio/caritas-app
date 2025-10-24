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
import useGetSpeciality from '../hooks/use-get-speciality'
import usePostSpeciality from '../hooks/use-post-speciality'
import useUpdateSpeciality from '../hooks/use-update-speciality'
import {
  type FormSpecialitySchema,
  formSpecialitySchema,
} from '../models/speciality-form'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: { id?: number }
  clearSelection?: () => void
}

export default function SpecialityFormDialog({
  open,
  onOpenChange,
  initialData,
  clearSelection,
}: Readonly<Props>) {
  const viewType = initialData?.id ? 'edit' : 'new'
  const { data: user } = useSession()

  const { data: specialityData, isFetching } = useGetSpeciality(initialData?.id)
  const { mutate: createSpeciality, isPending: isCreating } =
    usePostSpeciality()
  const { mutate: updateSpeciality, isPending: isUpdating } =
    useUpdateSpeciality()

  const form = useForm<FormSpecialitySchema>({
    resolver: zodResolver(formSpecialitySchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (specialityData) {
      form.reset({ name: specialityData.name })
    } else if (!initialData?.id) {
      form.reset({ name: '' })
    }
  }, [specialityData, initialData, form])

  useEffect(() => {
    if (!open) form.reset({ name: '' })
  }, [open, form])

  const handleSubmit = form.handleSubmit((data) => {
    if (!user) return

    if (viewType === 'edit' && initialData?.id) {
      updateSpeciality(
        { id: initialData.id, name: data.name },
        {
          onSuccess: () => {
            clearSelection?.()
            onOpenChange(false)
          },
          onError: (error) => {
            const err = error as { status?: number; message?: string }
            toast.error(err.message || 'Ocurrió un error al actualizar')
          },
        },
      )
    } else {
      createSpeciality(data, {
        onSuccess: () => {
          clearSelection?.()
          onOpenChange(false)
        },
        onError: (error) => {
          const err = error as { status?: number; message?: string }
          if (err.status === 400) {
            form.setError('name', {
              type: 'manual',
              message: err.message || 'La especialidad ya existe',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {viewType === 'edit'
              ? 'Editar Especialidad'
              : 'Registrar Nueva Especialidad'}
          </DialogTitle>
          <DialogDescription>
            {viewType === 'edit'
              ? 'Actualiza el nombre de la especialidad'
              : 'Complete la información de la especialidad'}
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
                    <FormLabel>Nombre de la Especialidad</FormLabel>
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
                  onClick={() => onOpenChange(false)}
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
