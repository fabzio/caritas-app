import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Spinner } from '@workspace/ui/components/spinner'
import { HeartPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import usePostSpeciality from '../hooks/use-post-speciality'
import { formSpecialitySchema } from '../models/speciality'

export default function CreateSpeciality() {
  const [open, setOpen] = useState(false)
  const form = useForm({
    resolver: zodResolver(formSpecialitySchema),
    defaultValues: {
      name: '',
    },
  })

  const { mutate, isPending } = usePostSpeciality()
  const { data: user } = useSession()

  const handleSubmit = form.handleSubmit((data) => {
    if (!user) return
    const params = { ...data, createdBy: user.user.id, active: true }
    mutate(params, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <HeartPlus /> Nueva especialidad
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar nueva especialidad</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="mt-2" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            className="mt-2 col-span-2"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
