import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearch } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
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
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useLogin } from '@/modules/auth/hooks/use-login'
import GoogleButton from '../../components/google-button'

export default function FormLogin() {
  const { redirect } = useSearch({ from: '/auth/login' })
  const { mutate, isPending } = useLogin(redirect)
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: (data) => {
        alert(JSON.stringify(data, null, 2))
      },
    })
  })
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Le damos la bienvenida</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Inicie sesión para continuar a <b> Cáritas Lima 365</b>
          </p>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Contraseña</FormLabel>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm underline underline-offset-4"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Recuérdame</FormLabel>
            </FormItem>
          )}
        />

        <Button className="mt-2" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin w-2" /> : 'Ingresar'}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            O
          </span>
        </div>
        <GoogleButton buttonText="Ingresa con Google" />
        <div className="text-center text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/auth/register" className="underline underline-offset-4">
            Regístrate
          </Link>
        </div>
      </form>
    </Form>
  )
}

const schema = z.object({
  email: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
  rememberMe: z.boolean(),
})
type FormSchema = z.infer<typeof schema>
