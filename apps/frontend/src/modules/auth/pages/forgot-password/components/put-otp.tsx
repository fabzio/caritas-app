import { zodResolver } from '@hookform/resolvers/zod'
import { useSearch } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@workspace/ui/components/input-otp'
import { Spinner } from '@workspace/ui/components/spinner'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { useVerifyOtp } from '../hooks/use-verify-otp'

type Props = {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}
export default function PutOtp({ isOpen, setIsOpen }: Readonly<Props>) {
  const { email } = useSearch({
    from: '/auth/forgot-password',
  })
  const { mutate, isPending } = useVerifyOtp()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  })
  const handleSubmit = form.handleSubmit((data) => {
    mutate({
      email: email as string,
      otp: data.otp,
    })
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex justify-center">
          <Button variant="link">¿Ya tienes el código OTP?</Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recuperar contraseña</DialogTitle>
          <DialogDescription>
            Hemos enviado un código OTP a tu correo electrónico. Por favor,
            revisa tu bandeja de entrada e ingresa el código para continuar con
            el proceso de recuperación de contraseña.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código OTP</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
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
            {isPending ? <Spinner /> : 'Validar Código'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const formSchema = z.object({
  otp: z.string().length(6, 'El código OTP debe tener 6 dígitos'),
})
