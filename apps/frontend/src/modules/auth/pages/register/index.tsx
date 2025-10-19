import { env } from '@frontend/env'
import { useRegions } from '@frontend/hooks/use-regions'
import PasswordStrengthBar from '@frontend/shared/components/password-strength-bar'
import TurnstileWidget from '@frontend/shared/components/turnsile-widget'
import {
  type FormUserSchema,
  formUserSchema,
} from '@frontend/shared/models/user'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  RadioGroup,
  RadioGroupItem,
} from '@workspace/ui/components/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useRegister } from './hooks/use-register'

export default function Register() {
  const ref = useRef<TurnstileInstance>(null)
  const form = useForm<FormUserSchema>({
    resolver: zodResolver(formUserSchema),
    defaultValues: {
      name: '',
      surname: '',
      documentType: 'DNI',
      documentNumber: '',
      phone: '',
      email: '',
      password: '',
      birthDate: undefined,
      regionId: undefined,
      sex: undefined,
      confirmPassword: '',
      token: undefined,
    },
  })
  const { mutate, isPending } = useRegister()
  const { data: districts, isLoading } = useRegions()
  const passwordValue = form.watch('password') ?? ''
  const passwordStrength = getPasswordStrength(passwordValue)

  const handleSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onError() {
        ref.current?.reset()
      },
    })
  })
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center col-span-2">
          <h1 className="text-2xl font-bold">Le damos la bienvenida</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Regístrese para continuar a <b> {env.VITE_APP_TITLE}</b>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Tipo de documento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue placeholder="Selecciona el tipo de documento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                    <SelectItem value="PAS">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Número de documento</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={
                      form.watch('documentType') === 'PAS' ? 'text' : 'number'
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
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
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2">
            <PasswordStrengthBar password={form.watch('password')} />
            <div className="sr-only" aria-live="polite">
              {passwordValue
                ? `Fortaleza de contraseña: ${passwordStrength.label}`
                : ''}
            </div>
          </div>
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Fecha de nacimiento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          ' pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Elegir fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem className="col-span-1 space-y-3">
                <FormLabel>Sexo</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="M" />
                      </FormControl>
                      <FormLabel className="font-normal">Masculino</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="F" />
                      </FormControl>
                      <FormLabel className="font-normal">Femenino</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="regionId"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Distrito</FormLabel>

                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[200px] justify-between',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value
                          ? districts?.find((d) => d.id === field.value)?.name
                          : 'Selecciona tu distrito'}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar distrito"
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>
                          No se encontraron distritos.
                        </CommandEmpty>
                        <CommandGroup>
                          {isLoading ? (
                            <Loader2 className="animate-spin w-4 mx-auto" />
                          ) : (
                            districts?.map((district) => (
                              <CommandItem
                                value={district.name}
                                key={district.id}
                                onSelect={() => {
                                  form.setValue('regionId', district.id)
                                }}
                              >
                                {district.name}
                                <Check
                                  className={cn(
                                    'ml-auto',
                                    district.id === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <TurnstileWidget
          ref={ref}
          onSuccess={(token) => form.setValue('token', token)}
        />
        <Button className="mt-2 col-span-2" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin w-2" /> : 'Registrar'}
        </Button>
        <div className="text-center text-sm col-span-2">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/auth/login"
            search={{
              redirect: '/',
            }}
            className="underline underline-offset-4"
          >
            Inicia sesión
          </Link>
        </div>
      </form>
    </Form>
  )
}

const getPasswordStrength = (pwd: string) => {
  if (!pwd) return { score: 0, label: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte']
  return { score, label: labels[score] ?? '' }
}
