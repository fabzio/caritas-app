import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
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
import { Separator } from '@workspace/ui/components/separator'
import { Spinner } from '@workspace/ui/components/spinner'
import { format } from 'date-fns'
import {
  Building,
  CalendarIcon,
  HeartPlus,
  Loader2,
  Plus,
  ShieldPlus,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import OrganizationFormDialog from '../../../allies/components/organization-form-dialog'
import SpecialityFormDialog from '../../../specialities/components/speciality-form-dialog'
import {
  useActivityStatuses,
  useActivityTypes,
  useAllies,
  useSpecialities,
} from '../../hooks/use-activity-catalogs'
import { useCreateCompleteActivity } from '../../hooks/use-create-complete-activity'
import { createCompleteActivitySchema } from '../../models/schema'

export default function CreateActivityForm() {
  const navigate = useNavigate()
  const { data: user } = useSession()

  // Create new speciality and ally
  const [isSpecialityFormOpen, setSpecialityFormOpen] = useState(false)
  const [isAllyFormOpen, setAllyFormOpen] = useState({
    open: false,
    type: 'new',
  })
  const handleNewSpeciality = () => {
    setSpecialityFormOpen(true)
  }
  const handleNewAlly = () => {
    setAllyFormOpen({ open: true, type: 'new' })
  }

  const form = useForm({
    resolver: zodResolver(createCompleteActivitySchema),
    defaultValues: {
      name: '',
      durationHours: 2,
      participants: [{ alliedId: '', specialityIds: [] }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  })

  const { data: activityTypes, isLoading: loadingTypes } = useActivityTypes()
  const { data: activityStatuses, isLoading: loadingStatuses } =
    useActivityStatuses()
  const { data: allies, isLoading: loadingAllies } = useAllies()
  const { data: specialities, isLoading: loadingSpecialities } =
    useSpecialities()

  const { mutate, isPending } = useCreateCompleteActivity()

  const handleSubmit = form.handleSubmit((data) => {
    if (!user?.session?.activeOrganizationId) return

    const { durationHours, ...rest } = data

    mutate(
      {
        ...rest,
        duration: `${durationHours} hours`,
        userId: user.user.id,
        spaceId: user.session.activeOrganizationId,
      },
      {
        onSuccess: () => {
          navigate({ to: '/health/activities' })
        },
      },
    )
  })

  const isLoading =
    loadingTypes || loadingStatuses || loadingAllies || loadingSpecialities

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Registrar nueva Actividad
        </h1>
        <span className="text-muted-foreground">
          Complete la información de la actividad y sus participantes
        </span>
        <Separator />
      </div>

      <div className="flex justify-center">
        <div className="w-full lg:w-3/4">
          <header className="pb-4">
            <h2 className="text-lg font-semibold">
              Información de la Actividad
            </h2>
            <p className="text-sm text-muted-foreground">
              Complete todos los campos requeridos*
            </p>
          </header>
          <div>
            <Form {...form}>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Actividad*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: Campaña de vacunación"
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de la Actividad*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="justify-start text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Seleccione una fecha</span>
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
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración (horas)*</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="typeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Actividad*</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activityTypes?.map(
                              (type: { id: number; name: string }) => (
                                <SelectItem
                                  key={type.id}
                                  value={type.id.toString()}
                                >
                                  {type.name}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="statusId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado*</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activityStatuses?.map(
                              (status: { id: number; name: string }) => (
                                <SelectItem
                                  key={status.id}
                                  value={status.id.toString()}
                                >
                                  {status.name}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Participantes (Organizaciones aliadas y Especialidades)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Agregue las organizaciones aliadas que participarán y
                        seleccione sus especialidades
                      </p>
                    </div>
                  </div>

                  {fields.map((field, index) => {
                    const selectedAlliedIds = form
                      .watch('participants')
                      .map((p) => p.alliedId)
                      .filter((id, idx) => idx !== index && id)

                    const availableAllies = allies?.filter(
                      (ally: { id: string; name: string }) =>
                        !selectedAlliedIds.includes(ally.id),
                    )

                    return (
                      <div key={field.id} className="border rounded-md py-2">
                        <div className="pb-3 px-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-medium">
                              Participante {index + 1}
                            </h4>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4 px-4 pb-4">
                          {availableAllies && availableAllies.length > 0 ? (
                            <FormField
                              control={form.control}
                              name={`participants.${index}.alliedId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Aliado*</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un aliado" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {availableAllies?.map(
                                        (ally: {
                                          id: string
                                          name: string
                                        }) => (
                                          <SelectItem
                                            key={ally.id}
                                            value={ally.id}
                                          >
                                            {ally.name}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No hay organizaciones disponibles.
                            </span>
                          )}

                          <FormField
                            control={form.control}
                            name={`participants.${index}.specialityIds`}
                            render={() => (
                              <FormItem>
                                <FormLabel>Especialidades*</FormLabel>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                  {specialities && specialities.length > 0 ? (
                                    specialities.map(
                                      (speciality: {
                                        id: number
                                        name: string
                                      }) => (
                                        <FormField
                                          key={speciality.id}
                                          control={form.control}
                                          name={`participants.${index}.specialityIds`}
                                          render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(
                                                    speciality.id,
                                                  )}
                                                  onCheckedChange={(
                                                    checked,
                                                  ) => {
                                                    const currentValue =
                                                      field.value || []
                                                    if (checked) {
                                                      field.onChange([
                                                        ...currentValue,
                                                        speciality.id,
                                                      ])
                                                    } else {
                                                      field.onChange(
                                                        currentValue.filter(
                                                          (id) =>
                                                            id !==
                                                            speciality.id,
                                                        ),
                                                      )
                                                    }
                                                  }}
                                                />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                {speciality.name}
                                              </FormLabel>
                                            </FormItem>
                                          )}
                                        />
                                      ),
                                    )
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      No hay especialidades disponibles.
                                    </span>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button type="button" onClick={handleNewAlly} size="sm">
                      Crear organización <ShieldPlus size={16} />
                    </Button>
                    <Button type="button" onClick={handleNewSpeciality} size="sm">
                      Crear especialidad <HeartPlus size={16} />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({ alliedId: '', specialityIds: [] })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Participante
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between px-0 pt-6">
                  <Button type="button" variant="outline" asChild>
                    <Link to="/health/activities">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Spinner /> : 'Crear Actividad'}
                  </Button>
                </div>
              </form>
            </Form>
            <SpecialityFormDialog
              open={isSpecialityFormOpen}
              onOpenChange={setSpecialityFormOpen}
              initialData={undefined}
              clearSelection={() => {}}
            />
            <OrganizationFormDialog
              open={isAllyFormOpen.open}
              onOpenChange={setAllyFormOpen}
              initialData={undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
