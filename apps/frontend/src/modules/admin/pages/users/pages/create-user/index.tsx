import { useRegions } from '@frontend/hooks/use-regions'
import { useSession } from '@frontend/hooks/use-session'
import { DEFAULT_TEAMS } from '@frontend/shared/constants/default-teams'
import { formUserSchema } from '@frontend/shared/models/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, Link, useSearch } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import { Checkbox } from '@workspace/ui/components/checkbox'
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
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import z from 'zod'
import DeleteSelfAdminDialog from './components/delete-self-admin-dialog'
import { useCreateUser } from './hooks/use-create-user'
import { useListTeams } from './hooks/use-list-teams'
import { useUpdateUser } from './hooks/use-update-user'

export default function FormView() {
  const viewType = useSearch({
    from: '/_authenticated/admin/users/form',
    select: (search) => search.type,
  })
  const loaderData = getRouteApi(
    '/_authenticated/admin/users/form',
  ).useLoaderData()

  const { data: session } = useSession()

  const { data: regions, isLoading: regionsLoading } = useRegions()
  const { data: teams, isLoading: teamsLoading } = useListTeams()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      viewType === 'edit'
        ? {
            name: loaderData?.name,
            surname: loaderData?.surname,
            email: loaderData?.email,
            phone: loaderData?.phone,
            documentType:
              (loaderData?.documentType as 'DNI' | 'CE' | 'PAS') ?? 'DNI',
            documentNumber: loaderData?.documentNumber,
            birthDate: loaderData?.birthDate,
            sex: loaderData?.sex,
            regionId: loaderData?.regionId,
            teamIds: loaderData?.teams?.map((team) => team.id) ?? [],
          }
        : {
            name: '',
            surname: '',
            email: '',
            phone: '',
            documentType: 'DNI',
            documentNumber: '',
            birthDate: undefined,
            sex: undefined,
            regionId: undefined,
            teamIds: [],
          },
  })

  const { mutate: createUser } = useCreateUser()

  const { mutate: updateUser } = useUpdateUser()

  const [showAdminRemovalDialog, setShowAdminRemovalDialog] = useState(false)
  const [pendingValues, setPendingValues] = useState<z.infer<
    typeof formSchema
  > | null>(null)

  const submitUpdate = (values: z.infer<typeof formSchema>) => {
    if (!(viewType === 'edit' && loaderData?.id)) return
    updateUser({
      userId: loaderData.id,
      data: {
        email: values.email,
        name: values.name,
        role: loaderData.role,
        surname: values.surname,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        sex: values.sex,
        birthDate: values.birthDate,
        phone: values.phone,
        regionId: values.regionId,
      },
      teamIds: hasTeamChanges(loaderData?.teams ?? [], values.teamIds)
        ? values.teamIds
        : undefined,
    })
  }

  const handleAdminRemovalConfirm = () => {
    if (!pendingValues) return
    submitUpdate(pendingValues)
    setPendingValues(null)
    setShowAdminRemovalDialog(false)
  }

  const handleAdminRemovalDialogChange = (open: boolean) => {
    setShowAdminRemovalDialog(open)
    if (!open) setPendingValues(null)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (viewType === 'edit' && loaderData?.id) {
      const adminTeamId = loaderData.teams?.find(
        (team) => team.name === DEFAULT_TEAMS.ADMIN,
      )?.id
      const currentUserId = session?.user?.id
      const isCurrentUser = currentUserId === loaderData.id
      const isRemovingAdmin =
        isCurrentUser && adminTeamId && !values.teamIds.includes(adminTeamId)

      if (isRemovingAdmin) {
        setPendingValues(values)
        setShowAdminRemovalDialog(true)
        return
      }

      submitUpdate(values)
    } else
      createUser({
        email: values.email,
        name: values.name,
        role: 'admin',
        password: 'default',
        data: {
          surname: values.surname,
          documentType: values.documentType,
          documentNumber: values.documentNumber,
          sex: values.sex,
          birthDate: values.birthDate,
          phone: values.phone,
          regionId: values.regionId,
        },
        teamIds: values.teamIds,
      })
  }

  return (
    <>
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
                        <Input
                          type="tel"
                          placeholder="+51 987 654 321"
                          {...field}
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
                                ? regions?.find((r) => r.id === field.value)
                                    ?.name
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
                <FormField
                  control={form.control}
                  name="teamIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipos</FormLabel>
                      <div className="flex flex-col gap-2">
                        {renderTeamCheckboxes(field, teams, teamsLoading)}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full flex gap-2 justify-center">
                <Button type="submit" className="mt-4">
                  {dependantText.submit[viewType]}
                </Button>
                <Link to="/admin/users">
                  <Button variant="outline" className="mt-4">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <DeleteSelfAdminDialog
        open={showAdminRemovalDialog}
        onOpenChange={handleAdminRemovalDialogChange}
        onConfirm={handleAdminRemovalConfirm}
      />
    </>
  )
}

const dependantText = {
  mainTitle: {
    new: 'Crear nuevo usuario',
    edit: 'Editar un usuario',
  },
  submit: {
    new: 'Crear Usuario',
    edit: 'Guardar Cambios',
  },
}

const formSchema = formUserSchema
  .omit({
    password: true,
    confirmPassword: true,
  })
  .extend({
    teamIds: z.array(z.string()).min(1, 'Selecciona al menos un equipo'),
  })

const hasTeamChanges = (
  originalTeams: { id: string }[],
  currentTeamIds: string[],
) => {
  const originalIds = originalTeams.map((team) => team.id)
  if (originalIds.length !== currentTeamIds.length) return true
  const sortAlphabetically = (ids: string[]) =>
    [...ids].sort((a, b) => a.localeCompare(b))
  const sortedOriginal = sortAlphabetically(originalIds)
  const sortedCurrent = sortAlphabetically(currentTeamIds)
  return sortedOriginal.some((id, index) => id !== sortedCurrent[index])
}

const renderTeamCheckboxes = (
  field: ControllerRenderProps<z.infer<typeof formSchema>, 'teamIds'>,
  teamList: { id: string; name: string }[] | undefined,
  loading: boolean,
) => {
  if (loading) return <Loader2 className="h-4 w-4 animate-spin" />
  if (!teamList || teamList.length === 0)
    return (
      <span className="text-sm text-muted-foreground">
        No hay equipos disponibles
      </span>
    )
  return teamList.map((team) => {
    const checked = field.value?.includes(team.id) ?? false
    const handleChange = (next: boolean | 'indeterminate') => {
      const current = field.value ?? []
      if (next === true && !checked) field.onChange([...current, team.id])
      if (next === false && checked)
        field.onChange(current.filter((value) => value !== team.id))
    }
    return (
      <div key={team.id} className="flex flex-row items-center gap-3 px-3 py-2">
        <Checkbox checked={checked} onCheckedChange={handleChange} />
        <span className="text-sm font-normal">{team.name}</span>
      </div>
    )
  })
}
