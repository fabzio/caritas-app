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
import { useFormContext } from 'react-hook-form'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isLoading: boolean
  viewType: 'new' | 'edit'
}

export default function SpecialityFormDialog({
  open,
  onOpenChange,
  handleSubmit,
  isLoading,
  viewType,
}: Readonly<Props>) {
  const submitLabel = viewType === 'edit' ? 'Guardar Cambios' : 'Registrar'
  const form = useFormContext()

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
              <DialogClose asChild>
                <Button type="button" variant="outline">
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
