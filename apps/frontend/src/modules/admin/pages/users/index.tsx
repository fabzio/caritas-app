import { useRegions } from '@frontend/hooks/use-regions'
import { formUserSchema } from '@frontend/shared/models/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { SelectValue } from '@radix-ui/react-select'
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
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
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  UserPlus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import ActionsButton from './components/actions-button'
import RoleFilter from './components/role-filter'
import SearchUserInput from './components/search-user-input'
import UserTable from './components/user-table'
import { useBanUser } from './hooks/use-ban-user'
import { useCreateUser } from './hooks/use-create-user'
import { useRemoveUser } from './hooks/use-remove-user'
import { useUserTable } from './hooks/use-table'

interface TableViewProps {
  onChangeToFormView: () => void
}
function TableView(props: Readonly<TableViewProps>) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const { mutateAsync: removeUser, isPending: removeUserIsPending } =
    useRemoveUser()
  const { mutateAsync: banUser, isPending: banUserIsPending } = useBanUser()
  const { data } = useUserTable()
  const { users } = data

  const uniqueRoles = useMemo(() => {
    if (!users) return []
    const roles = users
      .map((user) => user.role)
      .filter((role): role is string => role !== null && role !== undefined)
    return Array.from(new Set(roles)).sort()
  }, [users])

  const filteredUsers = useMemo(() => {
    if (!users || roleFilter === 'all') return users
    return users.filter((user) => user.role === roleFilter)
  }, [users, roleFilter])

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedUsers = selectedRows
    .map((rowIndex) => filteredUsers?.[rowIndex])
    .filter((user): user is NonNullable<typeof user> => Boolean(user))

  const resetSelectedRows = () => setRowSelection({})

  const userCount = selectedUsers.length

  const handleDelete = async () => {
    //TODO: Validation for same user deletion
    const allUserPromises = selectedUsers.flatMap((user) => [
      removeUser({ userId: user.id }),
      banUser({ userId: user.id, banReason: 'User deleted by admin' }),
    ])

    const results = await Promise.allSettled(allUserPromises)

    let totalSuccessful = 0

    for (let i = 0; i < selectedUsers.length; i++) {
      const removeResult = results[i * 2]
      const banResult = results[i * 2 + 1]

      if (
        removeResult.status === 'fulfilled' &&
        banResult.status === 'fulfilled'
      ) {
        totalSuccessful++
      }
    }

    const totalFailed = selectedUsers.length - totalSuccessful

    if (totalSuccessful > 0) {
      toast.success(
        `${totalSuccessful} de ${selectedUsers.length} usuario(s) eliminados correctamente.`,
      )
    }

    if (totalFailed > 0) {
      toast.error(
        `Atención: Falló el procesamiento de ${totalFailed} usuario(s).`,
      )
    }

    setIsDeleteModalOpen(false)
    resetSelectedRows()
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex-1 w-full">
            <SearchUserInput />
          </div>
          <div className="sm:w-auto w-full">
            <RoleFilter
              value={roleFilter}
              onValueChange={setRoleFilter}
              roles={uniqueRoles}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton />
          <Button onClick={props.onChangeToFormView}>
            <UserPlus />
            Nuevo usuario
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <UserTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {`¿Seguro que desea eliminar ${userCount} usuario${userCount !== 1 ? 's' : ''}?`}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={removeUserIsPending || banUserIsPending}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const formSchema = formUserSchema.omit({
  password: true,
  confirmPassword: true,
})

interface FormViewProps {
  onChangeToTableView: () => void
}
function FormView(props: Readonly<FormViewProps>) {
  const { data: regions, isLoading: regionsLoading } = useRegions()
  const form = useForm({
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

  const { mutate } = useCreateUser({
    onSuccess: () => {
      toast.success('Creado el usuario exitosamente')
      props.onChangeToTableView()
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({
      ...values,
      birthDate: values.birthDate,
      banExpires: null,
      banReason: null,
      banned: null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAnonymous: null,
      role: 'user',
      image: null,
    })
  }

  return (
    <div className="w-full p-4">
      <div className="mt-4 w-full md:w-3/5 mx-auto">
        <h1 className="text-2xl font-medium">Crear nuevo usuario</h1>
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

            <Separator />

            <Button type="submit" className="mt-4">
              Guardar Cambios
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default function User() {
  const [view, setView] = useState<'table' | 'form'>('table')

  switch (view) {
    case 'table':
      return <TableView onChangeToFormView={() => setView('form')} />
    case 'form':
      return <FormView onChangeToTableView={() => setView('table')} />
  }
}
