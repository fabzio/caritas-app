import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
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
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useActivityById } from '../../hooks/use-activity-by-id'
import {
  useActivityStatuses,
  useActivityTypes,
  useAllies,
  useSpecialities,
} from '../../hooks/use-activity-catalogs'
import { useUpdateCompleteActivity } from '../../hooks/use-update-complete-activity'
import {
  type CreateCompleteActivityFormSchema,
  createCompleteActivitySchema,
} from '../create-activity-form/schema'

export default function EditActivityForm() {
  const { id } = useParams({
    from: '/_authenticated/health/activities/edit/$id',
  })
  const navigate = useNavigate()
  const { data: user } = useSession()

  const { data: activity, isLoading: loadingActivity } = useActivityById(id)
  const { data: activityTypes, isLoading: loadingTypes } = useActivityTypes()
  const { data: activityStatuses, isLoading: loadingStatuses } =
    useActivityStatuses()
  const { data: allies, isLoading: loadingAllies } = useAllies()
  const { data: specialities, isLoading: loadingSpecialities } =
    useSpecialities()

  const form = useForm<CreateCompleteActivityFormSchema>({
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

  const formReset = form.reset
  const setValue = form.setValue

  useEffect(() => {
    if (
      activity &&
      activityTypes &&
      activityStatuses &&
      allies &&
      specialities
    ) {
      const durationMatch = activity.duration.match(/(\d+)/)
      const hours = durationMatch ? Number.parseInt(durationMatch[1], 10) : 2

      formReset({
        name: activity.name,
        date: new Date(activity.date),
        durationHours: hours,
        typeId: activity.typeId,
        statusId: activity.statusId,
        participants:
          activity.participants.length > 0
            ? activity.participants
            : [{ alliedId: '', specialityIds: [] }],
      })

      // Refuerzo explícito para selects controlados
      setValue('typeId', activity.typeId)
      setValue('statusId', activity.statusId)
    }
  }, [
    activity,
    activityTypes,
    activityStatuses,
    allies,
    specialities,
    formReset,
    setValue,
  ])

  const { mutate, isPending } = useUpdateCompleteActivity(id)

  const handleSubmit = form.handleSubmit((data) => {
    if (!user || !user.session?.activeOrganizationId) return

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
    loadingActivity ||
    loadingTypes ||
    loadingStatuses ||
    loadingAllies ||
    loadingSpecialities

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Actividad no encontrada</p>
        <Link to="/health/activities">
          <Button variant="outline">Volver al listado</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Editar Actividad
        </h1>
        <span className="text-muted-foreground">
          Modifique la información de la actividad y sus participantes
        </span>
        <Separator />
      </div>

      <div className="flex justify-center">
        <Card className="w-full lg:w-3/4">
          <CardHeader>
            <CardTitle>Información de la Actividad</CardTitle>
            <CardDescription>
              Complete todos los campos requeridos*
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <FormMessage />
                        <span>{field.value.length}/100</span>
                      </div>
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
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione las horas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(
                              (hours) => (
                                <SelectItem
                                  key={hours}
                                  value={hours.toString()}
                                >
                                  {hours} {hours === 1 ? 'hora' : 'horas'}
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
                        Participantes (Aliados y Especialidades)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Agregue los aliados que participarán y seleccione sus
                        especialidades
                      </p>
                    </div>
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

                  {fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Participante {index + 1}
                          </CardTitle>
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
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                                  {allies?.map(
                                    (ally: { id: string; name: string }) => (
                                      <SelectItem key={ally.id} value={ally.id}>
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

                        <FormField
                          control={form.control}
                          name={`participants.${index}.specialityIds`}
                          render={() => (
                            <FormItem>
                              <FormLabel>Especialidades*</FormLabel>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {specialities?.map(
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
                                              onCheckedChange={(checked) => {
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
                                                        id !== speciality.id,
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
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <CardFooter className="flex justify-between px-0 pt-6">
                  <Button type="button" variant="outline" asChild>
                    <Link to="/health/activities">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
