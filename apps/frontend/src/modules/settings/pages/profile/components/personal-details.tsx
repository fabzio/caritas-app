import { useSession } from '@frontend/hooks/use-session'
import { formUserSchema } from '@frontend/shared/models/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { useForm } from 'react-hook-form'

type PersonalFormValues = {
  name: string
  surname: string
  phone: string
}

const personalFormSchema = formUserSchema.omit({
  sex: true,
  birthDate: true,
  regionId: true,
  email: true,
  documentType: true,
  documentNumber: true,
  password: true,
  confirmPassword: true,
})

export default function PersonalDetails() {
  const { data } = useSession()
  const user = data?.user
  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      surname: user?.surname ?? '',
      phone: user?.phone ?? '',
    },
  })

  const onSubmit = form.handleSubmit(() => {})

  return (
    <div className="my-4 w-3/5">
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Teléfono" {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="secondary" className="mt-4">
            Guardar Cambios
          </Button>
        </form>
      </Form>
    </div>
  )
}
