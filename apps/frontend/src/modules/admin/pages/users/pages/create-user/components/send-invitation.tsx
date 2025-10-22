import { env } from '@frontend/env'
import { useInvitation } from '@frontend/hooks/use-invitation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

export default function SendInvitation() {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useInvitation()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      teams: [],
    },
  })
  const handleSubmit = form.handleSubmit((data) => {
    mutate(
      {
        email: data.email,
        roles: data.teams,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      },
    )
  })
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) form.reset()
        setOpen(val)
      }}
    >
      <DialogTrigger asChild>
        <div className="flex justify-center">
          <Button variant="link">¿El usuario ya tiene una cuenta?</Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar a {env.VITE_ORG_NAME}</DialogTitle>
          <DialogDescription>
            Si el usuario ya tiene una cuenta, puede invitarlo a unirse a{' '}
            {env.VITE_ORG_NAME}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-2" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Introduce el email del usuario"
                      {...field}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teams"
              render={() => (
                <FormItem>
                  <FormLabel className="mb-2">Equipos</FormLabel>

                  {teams.map((team) => (
                    <FormField
                      key={team.id}
                      control={form.control}
                      name="teams"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(
                                team.id as
                                  | 'healthMember'
                                  | 'educationMember'
                                  | 'admin',
                              )}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, team.id])
                                  : field.onChange(
                                      field.value.filter(
                                        (value) => value !== team.id,
                                      ),
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {team.name}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button disabled={isPending} onClick={handleSubmit}>
            {isPending ? <Spinner /> : 'Enviar invitación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const formSchema = z.object({
  email: z.email(),
  teams: z
    .array(z.enum(['healthMember', 'educationMember', 'admin']))
    .min(1, 'Selecciona al menos un equipo'),
})

const teams = [
  {
    id: 'healthMember',
    name: 'Salud',
  },
  {
    id: 'educationMember',
    name: 'Educación',
  },
  {
    id: 'admin',
    name: 'Administración',
  },
]
