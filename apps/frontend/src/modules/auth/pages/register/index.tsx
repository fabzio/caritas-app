import { zodResolver } from '@hookform/resolvers/zod'
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
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import GoogleButton from '../../components/google-button'
import { useRegister } from '../../hooks/use-register'

export default function Register() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      dni: '',
      phone: '',
      email: '',
      password: '',
      birthDate: undefined,
      district: '',
      sex: undefined,
    },
  })
  const { mutate, isPending } = useRegister()
  const handleSubmit = form.handleSubmit((data) => {
    mutate(
      { ...data, birthDate: data.birthDate.toISOString().split('T')[0] },
      {
        onSuccess: () => {
          toast.success('Registro exitoso, por favor inicia sesión')
        },
      },
    )
  })
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center col-span-2">
          <h1 className="text-2xl font-bold">Le damos la bienvenida</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Regístrese para continuar a <b> Cáritas Lima 365</b>
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
            name="dni"
            render={({ field }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormLabel>DNI</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
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
            name="district"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Distrito</FormLabel>

                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-[200px] justify-between',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value
                          ? districts.find(
                              (district) => district === field.value,
                            )
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
                          {districts.map((district) => (
                            <CommandItem
                              value={district}
                              key={district}
                              onSelect={(value) => {
                                form.setValue('district', value)
                              }}
                            >
                              {district}
                              <Check
                                className={cn(
                                  'ml-auto',
                                  district === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                            </CommandItem>
                          ))}
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
        <Button className="mt-2 col-span-2" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin w-2" /> : 'Registrar'}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t col-span-2">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            O
          </span>
        </div>
        <div className="col-span-2">
          <GoogleButton buttonText="Registrate con Google" />
        </div>
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

const formSchema = z.object({
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una letra y un número',
  }),
  name: z.string().nonempty(),
  surname: z.string().nonempty(),
  phone: z.string().nonempty(),
  birthDate: z.date(),
  sex: z.enum(['M', 'F']),
  email: z.email(),
  dni: z.string().length(8),
  district: z.string().nonempty(),
})
type FormSchema = z.infer<typeof formSchema>
const districts = [
  'Lima',
  'Ancon',
  'Ate',
  'Barranco',
  'Breña',
  'Carabayllo',
  'Chaclacayo',
  'Chorrillos',
  'Cieneguilla',
  'Comas',
  'El Agustino',
  'Independencia',
  'Jesus Maria',
  'La Molina',
  'La Victoria',
  'Lince',
  'Los Olivos',
  'Lurigancho',
  'Lurin',
  'Magdalena Del Mar',
  'Miraflores',
  'Pachacamac',
  'Pucusana',
  'Pueblo Libre',
  'Puente Piedra',
  'Punta Hermosa',
  'Punta Negra',
  'Rimac',
  'San Bartolo',
  'San Borja',
  'San Isidro',
  'San Juan De Lurigancho',
  'San Juan De Miraflores',
  'San Luis',
  'San Martin De Porres',
  'San Miguel',
  'Santa Anita',
  'Santa Maria Del Mar',
  'Santa Rosa',
  'Santiago De Surco',
  'Surquillo',
  'Villa El Salvador',
  'Villa Maria Del Triunfo',
] as const
