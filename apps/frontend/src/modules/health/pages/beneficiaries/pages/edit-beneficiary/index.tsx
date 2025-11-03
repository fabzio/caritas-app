import { useRegions } from '@frontend/hooks/use-regions'
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
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { useCreateBeneficiary } from '../../hooks/use-create-beneficiary'
import { useUpdateBeneficiary } from '../../hooks/use-update-beneficiary'

export default function FormView() {
  const { type: viewType } = useSearch({
    from: '/_authenticated/health/beneficiaries/form',
  })
  const loaderData = getRouteApi(
    '/_authenticated/health/beneficiaries/form',
  ).useLoaderData()

  const { data: regions, isLoading: regionsLoading } = useRegions()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: loaderData?.name || '',
      surname: loaderData?.surname || '',
      email: loaderData?.email || '',
      phone: loaderData?.phone || '',
      documentType: (loaderData?.documentType as 'DNI' | 'CE' | 'PAS') ?? 'DNI',
      documentNumber: loaderData?.documentNumber || '',
      birthDate: loaderData?.birthDate,
      sex: loaderData?.sex,
      regionId: loaderData?.regionId ?? 0,
      insuranceType: loaderData?.insuranceType ?? 'none',
    },
  })

  const { mutate: updateBeneficiary, isPending: isPendingUpdate } =
    useUpdateBeneficiary()
  const { mutate: createBeneficiary, isPending: isPendingCreate } =
    useCreateBeneficiary()

  const isEdit = viewType === 'edit'

  const submitUpdate = (values: z.infer<typeof formSchema>) => {
    if (!(isEdit && loaderData?.id)) return
    updateBeneficiary({
      userId: loaderData.id,
      data: {
        email: values.email.trim(),
        name: values.name.trim(),
        role: 'user',
        surname: values.surname.trim(),
        documentType: values.documentType,
        documentNumber: values.documentNumber.trim(),
        sex: values.sex,
        birthDate: values.birthDate,
        phone: values.phone.trim(),
        regionId: values.regionId,
      },
      insuranceType: values.insuranceType,
    })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEdit) {
      submitUpdate(values)
      return
    }

    createBeneficiary({
      email: values.email.trim(),
      name: values.name.trim(),
      role: 'user',
      password: import.meta.env.DEV ? 'default' : crypto.randomUUID(),
      data: {
        surname: values.surname.trim(),
        documentType: values.documentType,
        documentNumber: values.documentNumber.trim(),
        sex: values.sex,
        birthDate: values.birthDate,
        phone: values.phone.trim(),
        regionId: values.regionId,
      },
      insuranceType: values.insuranceType,
    })
  }

  const isSubmitting = isPendingUpdate || isPendingCreate

  return (
    <div className="w-full p-4">
      <div className="mt-4 w-full md:w-3/5 mx-auto">
        <h1 className="text-2xl font-medium">
          {dependantText.mainTitle[viewType]}
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                    <FormLabel>Distrito</FormLabel>
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
                              : 'Selecciona un distrito'}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
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
              <FormField
                control={form.control}
                name="insuranceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Seguro</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full flex gap-2 justify-center">
              <Button type="submit" className="mt-4" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : dependantText.submit[viewType]}
              </Button>
              <Link to="/health/beneficiaries">
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

const dependantText = {
  mainTitle: {
    edit: 'Editar beneficiario',
    new: 'Registrar beneficiario',
  },
  submit: {
    edit: 'Guardar Cambios',
    new: 'Registrar Beneficiario',
  },
} as const

const formSchema = formUserSchema
  .omit({
    password: true,
    confirmPassword: true,
  })
  .extend({
    insuranceType: z.enum(['none', 'public', 'private']),
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
