import TurnstileWidget from '@frontend/shared/components/turnsile-widget'
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
import { Spinner } from '@workspace/ui/components/spinner'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import PutOtp from './components/put-otp'
import { useForgotPassword } from './hooks/use-forgot-password'

export default function ForgotPassword() {
  const [open, setOpen] = useState(false)
  const { email: defaultEmail } = useSearch({
    from: '/auth/forgot-password',
  })
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail,
      token: undefined,
    },
  })
  const { mutate, isPending } = useForgotPassword()
  const onSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => setOpen(true),
    })
  })
  return (
    <div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Introduce tu correo electrónico"
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <TurnstileWidget
            onSuccess={(token) => form.setValue('token', token)}
          />
          {form.formState.errors.token && (
            <p className="text-sm text-red-600">
              {form.formState.errors.token.message}
            </p>
          )}
          <div className="flex justify-center">
            <Button disabled={isPending}>
              {isPending ? <Spinner /> : 'Enviar correo de recuperación'}
            </Button>
          </div>
        </form>
      </Form>
      <PutOtp isOpen={open} setIsOpen={setOpen} />
    </div>
  )
}

const formSchema = z
  .object({
    email: z.string().email(),
    token: z.string().optional(),
  })
  .refine((data) => !!data.token, {
    message: 'Completa el captcha',
    path: ['token'],
  })

type FormSchema = z.infer<typeof formSchema>
