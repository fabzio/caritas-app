import { useRegions } from '@frontend/hooks/use-regions'
import { formUserSchema } from '@frontend/shared/models/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, Link } from '@tanstack/react-router'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Spinner } from '@workspace/ui/components/spinner'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type z from 'zod'
import { useAddAttendant } from './hooks/use-add-attendant'

export default function AddAttendantPage() {
  const loaderData = getRouteApi(
    '/_authenticated/health/activities/$activityId/form',
  ).useLoaderData()

  const { mutate: addAttendant, isPending: isPendingCreate } = useAddAttendant()

  const formSchema = formUserSchema.omit({
    password: true,
    confirmPassword: true,
  })

  const { data: regions, isLoading: regionsLoading } = useRegions()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      documentType: 'DNI',
      documentNumber: '',
      birthDate: undefined,
      sex: undefined,
      regionId: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(loaderData)
    if (typeof loaderData?.id !== 'number') return
    addAttendant({
      email: values.email,
      name: values.name,
      role: 'user',
      password: import.meta.env.DEV ? 'default' : crypto.randomUUID(),
      data: {
        surname: values.surname,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        sex: values.sex,
        birthDate: values.birthDate,
        phone: values.phone,
        regionId: values.regionId,
      },
      activityId: loaderData.id,
    })
  }

  return (
    <div className="w-full p-4">
      <div className="mt-4 w-full md:w-3/5 mx-auto">
        <h1 className="text-2xl font-medium">Registrar Asistente</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
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
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
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
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="987 654 321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="CE">
                          Carnet de Extranjería
                        </SelectItem>
                        <SelectItem value="PASSPORT">Pasaporte</SelectItem>
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
                  <FormItem>
                    <FormLabel>Número de Documento</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          captionLayout="dropdown"
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
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
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona uno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Región</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? regions?.find((r) => r.id === field.value)?.name
                              : 'Selecciona una región'}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar región"
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>
                              No se encontraron regiones.
                            </CommandEmpty>
                            <CommandGroup>
                              {regionsLoading ? (
                                <Loader2 className="animate-spin w-4 mx-auto" />
                              ) : (
                                regions?.map((region) => (
                                  <CommandItem
                                    value={region.name}
                                    key={region.id}
                                    onSelect={() => {
                                      form.setValue('regionId', region.id)
                                    }}
                                  >
                                    {region.name}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        region.id === field.value
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
            <div className="w-full flex gap-2 justify-center">
              <Link
                to={
                  loaderData
                    ? '/health/activities/$activityId/assistance'
                    : '/health/activities'
                }
                params={{ activityId: loaderData?.id.toString() }}
              >
                <Button
                  type="submit"
                  className="mt-4"
                  disabled={isPendingCreate}
                >
                  {isPendingCreate ? <Spinner /> : 'Registrar Asistente'}
                </Button>
              </Link>
              <Link
                to={
                  loaderData
                    ? '/health/activities/$activityId/assistance'
                    : '/health/activities'
                }
                params={{ activityId: loaderData?.id.toString() }}
              >
                <Button variant="outline" className="mt-4">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
