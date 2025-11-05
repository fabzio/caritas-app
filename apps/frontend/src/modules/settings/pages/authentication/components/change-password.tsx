import { useChangePassword } from '@frontend/modules/settings/pages/authentication/hooks/use-change-password'
import PasswordStrengthBar from '@frontend/shared/components/password-strength-bar'
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
import { Spinner } from '@workspace/ui/components/spinner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export default function ChangePassword() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })
  const { mutate, isPending } = useChangePassword()
  const onSubmit = form.handleSubmit((data) =>
    mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          form.reset()
        },
      },
    ),
  )
  return (
    <div className="my-4 w-1/2">
      <Form {...form}>
        <form className="space-y-2" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña Actual</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Contraseña Actual"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Nueva Contraseña"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <PasswordStrengthBar password={form.watch('newPassword')} />
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirmar Nueva Contraseña"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : 'Cambiar Contraseña'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
const formSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
        message:
          'La contraseña debe tener al menos 8 caracteres, una letra, un número y un carácter especial',
      }),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  })
type FormSchema = z.infer<typeof formSchema>
