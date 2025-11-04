import { useRegions } from '@frontend/hooks/use-regions'
import { useUserDetail } from '@frontend/modules/admin/pages/users/pages/create-user/hooks/use-user-detail'
import { formUserSchema } from '@frontend/shared/models/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, Link, useSearch } from '@tanstack/react-router'
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
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Eraser,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { AutoComplete } from './components/autocomplete'
import { useAddAttendant } from './hooks/use-add-attendant'
import { useAddExistentUser } from './hooks/use-add-existent-user'
import { useUpdateAttendant } from './hooks/use-edit-attendant'
import {
  type ExistentUsers,
  useExistentUsers,
} from './hooks/use-list-users-autocomplete'

export default function AddAttendantPage() {
  const loaderData = getRouteApi(
    '/_authenticated/health/activities/$activityId/form',
  ).useLoaderData()
  const formattedDate = loaderData?.date
    ? format(new Date(loaderData.date), 'PPP', { locale: es })
    : ''

  const { id, type: viewType } = useSearch({
    from: '/_authenticated/health/activities/$activityId/form',
  })
  const { data: userData } = useUserDetail(id)

  const { mutate: addAttendant, isPending: isPendingCreate } = useAddAttendant()
  const { mutate: addExistentUser, isPending: isPendingAddExistent } =
    useAddExistentUser()
  const { mutate: updateAttendant, isPending: isPendingUpdate } =
    useUpdateAttendant()

  const { data: regions, isLoading: regionsLoading } = useRegions()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userData?.name || '',
      surname: userData?.surname || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      documentType: (userData?.documentType as 'DNI' | 'CE' | 'PAS') ?? 'DNI',
      documentNumber: userData?.documentNumber || '',
      birthDate: userData?.birthDate,
      sex: userData?.sex,
      regionId: userData?.regionId,
    },
  })

  const submitUpdate = (values: z.infer<typeof formSchema>) => {
    if (typeof loaderData?.id !== 'number') return
    if (!(viewType === 'edit' && userData?.id)) return
    updateAttendant({
      userId: userData.id,
      data: {
        email: values.email,
        name: values.name,
        surname: values.surname,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        sex: values.sex,
        birthDate: values.birthDate,
        phone: values.phone,
        regionId: values.regionId,
      },
      teamIds: undefined,
      activityId: loaderData.id,
    })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (typeof loaderData?.id !== 'number') return
    if (viewType === 'edit' && userData?.id) {
      submitUpdate(values)
    } else if (foundUser) {
      addExistentUser({
        userId: foundUser.id,
        activityId: loaderData.id,
      })
    } else {
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
  }

  const documentType = form.watch('documentType')
  const documentNumber = form.watch('documentNumber')
  const { data: existentUsers, isLoading: existentUsersLoading } =
    useExistentUsers({
      documentNumber,
      documentType,
      activityId: loaderData?.id as number,
    })

  const [foundUser, setFoundUser] = useState<ExistentUsers | null>(null)
  const handleClearFields = () => {
    form.reset({
      name: '',
      surname: '',
      email: '',
      phone: '',
      documentType: 'DNI',
      documentNumber: '',
      birthDate: undefined,
      sex: undefined,
      regionId: undefined,
    })
    setFoundUser(null)
  }

  return (
    <div className="w-full p-4">
      <div className="mt-4 w-full md:w-3/5 mx-auto">
        <h1 className="text-2xl font-medium">
          {dependentText.mainTitle[viewType]}
        </h1>
        <h2 className="text-lg font-light">
          {loaderData?.name} - {formattedDate}
        </h2>
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
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={foundUser !== null}
                      />
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
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={foundUser !== null}
                      />
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
                        disabled={foundUser !== null}
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
                      <Input
                        type="tel"
                        placeholder="987 654 321"
                        {...field}
                        disabled={foundUser !== null}
                      />
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
                      disabled={foundUser !== null}
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
                render={({ field }) => {
                  const selectedUser = existentUsers?.data.find(
                    (u) => u.documentNumber === field.value,
                  )
                  return viewType === 'new' ? (
                    <FormItem className="flex flex-col">
                      <FormLabel>Número de Documento</FormLabel>
                      <div className="flex flex-row w-full gap-2">
                        <div className="flex-1">
                          <AutoComplete
                            options={existentUsers?.data ?? []}
                            emptyMessage="No se encontraron beneficiarios."
                            isLoading={existentUsersLoading}
                            placeholder="Buscar o ingresar número de documento"
                            value={selectedUser}
                            nonSelectedValue={field.value}
                            onValueChange={(user) => {
                              field.onChange(user.documentNumber)
                              setFoundUser(user)
                              form.setValue('name', user.name)
                              form.setValue('surname', user.surname)
                              form.setValue('email', user.email)
                              form.setValue('phone', user.phone)
                              form.setValue('sex', user.sex)
                              form.setValue('regionId', user.regionId)
                              form.setValue('birthDate', user.birthDate)
                            }}
                            onInputChange={(val) => {
                              field.onChange(val)
                            }}
                            disabled={foundUser !== null}
                          />
                        </div>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={handleClearFields}
                          disabled={!foundUser}
                        >
                          <Eraser /> Limpiar
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  ) : (
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
                  )
                }}
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
                            disabled={foundUser !== null}
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
                      value={field.value}
                      disabled={foundUser !== null}
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
                            disabled={foundUser !== null}
                          >
                            {field.value
                              ? regions?.find((r) => r.id === field.value)?.name
                              : 'Selecciona una región'}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
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
              <Button
                type="submit"
                className="mt-4"
                disabled={
                  isPendingCreate || isPendingUpdate || isPendingAddExistent
                }
              >
                {isPendingCreate || isPendingUpdate || isPendingAddExistent ? (
                  <Spinner />
                ) : (
                  dependentText.submit[viewType]
                )}
              </Button>
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

const dependentText = {
  mainTitle: {
    new: 'Registrar Asistente',
    edit: 'Editar Asistente',
  },
  submit: {
    new: 'Registrar Asistente',
    edit: 'Guardar Cambios',
  },
}

const formSchema = formUserSchema
  .omit({
    password: true,
    confirmPassword: true,
  })
  .superRefine(({ documentNumber, documentType }, ctx) => {
    const trimmedValue = documentNumber.trim()

    if (documentType === 'DNI') {
      if (!/^\d+$/.test(trimmedValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documentNumber'],
          message: 'El DNI solo debe contener números',
        })
        return
      }

      if (trimmedValue.length !== 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documentNumber'],
          message: 'El DNI debe tener exactamente 8 dígitos',
        })
      }
      return
    }

    if (documentType === 'CE') {
      if (!/^[a-zA-Z0-9]+$/.test(trimmedValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documentNumber'],
          message:
            'El Carnet de Extranjería solo debe contener caracteres alfanuméricos',
        })
        return
      }

      if (trimmedValue.length > 12 || trimmedValue.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documentNumber'],
          message:
            'El Carnet de Extranjería debe tener como máximo 12 caracteres y como mínimo 6',
        })
      }
      return
    }

    if (documentType === 'PAS') {
      if (!/^[a-zA-Z0-9]+$/.test(trimmedValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documentNumber'],
          message: 'El Pasaporte solo debe contener caracteres alfanuméricos',
        })
        return
      }

      if (trimmedValue.length !== 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['documentNumber'],
          message: 'El Pasaporte debe tener exactamente 12 caracteres',
        })
      }
    }
  })
