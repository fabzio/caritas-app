import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
  Card,
  CardContent,
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
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useActivityById } from '../../hooks/use-activity-by-id'
import {
  useActivityStatuses,
  useActivityTypes,
  useAllies,
  useSpecialities,
} from '../../hooks/use-activity-catalogs'
import {
  type CreateCompleteActivityFormSchema,
  createCompleteActivitySchema,
} from '../create-activity-form/schema'

export default function ActivityDetailPage() {
  const { activityId } = useParams({
    from: '/_authenticated/health/activities/$activityId/',
  })

  const { data: activity, isLoading: loadingActivity } =
    useActivityById(activityId)
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

  const { fields } = useFieldArray({
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
          Actividad - {activity.name}
        </h1>
        <span className="text-muted-foreground">Detalle de la actividad</span>
        <Separator />
      </div>

      <div className="flex justify-center">
        <Card className="w-full lg:w-3/4">
          <CardHeader>
            <CardTitle>Información de la Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Actividad</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de la Actividad</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled
                                variant="outline"
                                className="justify-start text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>""</span>
                                )}
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
                        <FormLabel>Duración (horas)</FormLabel>
                        <Select value={field.value?.toString()} disabled>
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
                        <FormLabel>Tipo de Actividad</FormLabel>
                        <Select disabled value={field.value?.toString()}>
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
                        <FormLabel>Estado</FormLabel>
                        <Select disabled value={field.value?.toString()}>
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
                    </div>
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Participante {index + 1}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`participants.${index}.alliedId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aliado</FormLabel>
                              <Select disabled value={field.value}>
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
                              <FormLabel>Especialidades</FormLabel>
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
                                              disabled
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
                  <Link to="/health/activities">
                    <Button type="button" variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Regresar
                    </Button>
                  </Link>
                  <Button asChild>
                    <Link
                      to="/health/activities/$activityId/assistance"
                      params={{ activityId }}
                    >
                      Ver asistencia
                    </Link>
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
