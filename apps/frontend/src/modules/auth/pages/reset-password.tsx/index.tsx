import { zodResolver } from '@hookform/resolvers/zod'
import { useSearch } from '@tanstack/react-router'
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
import { z } from 'zod'
import { useResetPassword } from './hooks/use-reset-password'

export default function ResetPassword() {
  const { email, otp } = useSearch({ from: '/auth/reset-password' })
  const { mutate } = useResetPassword()
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })
  const handleSubmit = form.handleSubmit((data) => {
    mutate({ ...data, email, otp })
  })
  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-2">
          <FormField
            control={form.control}
            name="password"
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
          <FormField
            control={form.control}
            name="confirmPassword"
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
          <Button type="submit">Restablecer Contraseña</Button>
        </form>
      </Form>
    </div>
  )
}
const formSchema = z
  .object({
    password: z
      .string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
        message:
          'La contraseña debe tener al menos 8 caracteres, una letra, un número y un carácter especial',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormSchema = z.infer<typeof formSchema>
