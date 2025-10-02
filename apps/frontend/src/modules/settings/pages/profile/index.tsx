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
import { Separator } from '@workspace/ui/components/separator'
import { useForm } from 'react-hook-form'

export default function Profile() {
  const { data } = useSession()
  const user = data?.user
  const form = useForm({
    resolver: zodResolver(
      formUserSchema.omit({
        sex: true,
        birthDate: true,
        regionId: true,
        email: true,
        documentType: true,
        documentNumber: true,
        password: true,
        confirmPassword: true,
      }),
    ),
    defaultValues: {
      name: user?.name ?? '',
      surname: user?.surname ?? '',
      phone: user?.phone ?? '',
    },
  })

  return (
    <>
      <h1 className="text-2xl font-medium">Datos Personales</h1>
      <Separator />
      <div className="mt-4 w-3/5">
        <Form {...form}>
          <form className="space-y-4">
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
            <Button type="submit" className="mt-4">
              Guardar Cambios
            </Button>
          </form>
        </Form>
      </div>
    </>
  )
}
