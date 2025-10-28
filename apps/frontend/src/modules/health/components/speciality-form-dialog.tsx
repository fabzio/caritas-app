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
import usePostSpeciality from '../pages/specialities/hooks/use-post-speciality'
import useUpdateSpeciality from '../pages/specialities/hooks/use-update-speciality'

import {
  type FormSpecialitySchema,
  formSpecialitySchema,
  type Speciality,
} from '../pages/specialities/models/speciality-form'

const isSpeciality = (candidate: unknown): candidate is Speciality => {
  if (!candidate || typeof candidate !== 'object') return false
  const value = candidate as Record<string, unknown>
  return typeof value.id === 'number' && typeof value.name === 'string'
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  speciality?: Speciality | null
  onCompleted?: (params: {
    action: 'create' | 'update'
    speciality: Speciality
  }) => void
}

export default function SpecialityFormDialog({
  open,
  onOpenChange,
  speciality,
  onCompleted,
}: Readonly<Props>) {
  const form = useForm<FormSpecialitySchema>({
    resolver: zodResolver(formSpecialitySchema),
    defaultValues: { name: '' },
  })

  const { mutateAsync: createSpeciality, isPending: isCreating } =
    usePostSpeciality()
  const { mutateAsync: updateSpeciality, isPending: isUpdating } =
    useUpdateSpeciality()

  const isEditMode = Boolean(speciality?.id)
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (open) {
      form.reset({ name: speciality?.name ?? '' })
    }
  }, [open, speciality, form])

  const handleDialogChange = (flag: boolean) => {
    if (!flag) {
      form.reset({ name: '' })
    }
    onOpenChange(flag)
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditMode && speciality?.id) {
        const updated = await updateSpeciality({
          id: speciality.id,
          name: values.name,
        })
        const payload = isSpeciality(updated)
          ? updated
          : { ...speciality, name: values.name }
        onCompleted?.({ action: 'update', speciality: payload })
      } else {
        const created = await createSpeciality({
          name: values.name,
        })
        if (isSpeciality(created)) {
          onCompleted?.({ action: 'create', speciality: created })
        }
      }
      handleDialogChange(false)
    } catch (rawError) {
      const error = rawError as { status?: number; message?: string }
      if (error.status === 400) {
        form.setError('name', {
          type: 'manual',
          message: error.message || 'La especialidad ya existe',
        })
        return
      }
      toast.error(error.message || 'Ocurrió un error')
    }
  })

  const title = isEditMode
    ? 'Editar Especialidad'
    : 'Registrar Nueva Especialidad'
  const description = isEditMode
    ? 'Actualiza el nombre de la especialidad'
    : 'Complete la información de la especialidad'
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
                  <FormLabel>Nombre de la Especialidad</FormLabel>
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
