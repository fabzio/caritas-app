import { Link, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { format } from 'date-fns'
import { ArrowLeft, Baby, Loader2, User, UserPlus, Users } from 'lucide-react'
import { useActivityDetailById } from '../../hooks/use-activity-by-id'
import { useAllies, useSpecialities } from '../../hooks/use-activity-catalogs'

export default function ActivityDetailPage() {
  const { activityId } = useParams({
    from: '/_authenticated/health/activities/$activityId/',
  })

  const { data: activity, isLoading: loadingActivity } =
    useActivityDetailById(activityId)
  const { data: allies, isLoading: loadingAllies } = useAllies()
  const { data: specialities, isLoading: loadingSpecialities } =
    useSpecialities()

  const isLoading = loadingActivity || loadingAllies || loadingSpecialities

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

  const getAllyName = (alliedId: string): string => {
    const ally = allies?.find((a) => a.id === alliedId)
    return ally?.name || 'Aliado Desconocido'
  }

  const getSpecialityNames = (ids: number[]): string[] | undefined => {
    return specialities?.filter((s) => ids.includes(s.id)).map((s) => s.name)
  }

  const getAge = (date: string | number | Date) => {
    const today = new Date()
    const birthDate = new Date(date)
    let age = today.getFullYear() - birthDate.getFullYear()
    const month = today.getMonth() - birthDate.getMonth()
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate()))
      age--
    return age
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
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-start sm:items-center gap-4">
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
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Card className="w-full lg:w-3/4 pb-0">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="w-full lg:w-10/12 mx-auto">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Fecha */}
                  <div className="space-y-1">
                    <p className="text-sm  text-muted-foreground">Fecha</p>
                    <p className="min-h-10 text-sm font-medium">
                      {activity.date
                        ? format(new Date(activity.date), 'PPP')
                        : 'N/A'}
                    </p>
                  </div>

                  {/* Duración (horas) */}
                  <div className="space-y-1">
                    <p className="text-sm  text-muted-foreground">Duración</p>
                    <p className="min-h-10 text-sm font-medium">
                      {Number.parseInt(activity.duration, 10)} horas
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Organizacion */}
                  <div className="space-y-1">
                    <p className="text-sm  text-muted-foreground">
                      Organización
                    </p>
                    <p className="min-h-10 text-sm font-medium">
                      {activity.spaceName}
                    </p>
                  </div>
                  {/* Tipo */}
                  <div className="space-y-1">
                    <p className="text-sm  text-muted-foreground">Tipo</p>
                    <p className="min-h-10 text-sm font-medium">
                      {activity.typeName}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Distrito */}
                  <div className="space-y-1">
                    <p className="text-sm  text-muted-foreground">Distrito</p>
                    <p className="min-h-10 text-sm font-medium">
                      {activity.regionName}
                    </p>
                  </div>

                  {/* Estado */}
                  <div className="space-y-1">
                    <p className="text-sm  text-muted-foreground">Estado</p>
                    <p className="min-h-10 text-sm font-medium">
                      {activity.statusName}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {/* Dirección */}
                  <div className="space-y-1">
                    <p className="text-sm  text-muted-foreground">Dirección</p>
                    <p className="min-h-10 text-sm font-medium">
                      {activity.address}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Servicios</h3>
                  </div>
                </div>

                {activity.participants.map((participant) => (
                  <Card className="gap-3" key={participant.alliedId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        {/* Lado Izquierdo: Título */}
                        <CardTitle className="text-base">
                          {getAllyName(participant.alliedId)}
                        </CardTitle>
                        <span className="ml-4 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {participant.specialityIds.length}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      <div className="flex flex-col space-y-1">
                        <div className="flex flex-wrap gap-2">
                          {getSpecialityNames(participant.specialityIds)?.map(
                            (name) => (
                              <span
                                key={name}
                                className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-primary text-secondary-foreground"
                              >
                                {name}
                              </span>
                            ),
                          )}
                        </div>
                        {participant.specialityIds.length === 0 && (
                          <div className="text-sm text-muted-foreground italic">
                            No se asignaron especialidades.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <CardFooter className="flex justify-between px-0 pt-6"></CardFooter>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pb-4">
        <div className="w-full lg:w-3/4">
          <Separator className="mb-3 mt-1" />
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Resumen de Asistencia</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="gap-2">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Total Asistencia</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>

                <CardContent>{activity.attendants?.length}</CardContent>
              </Card>
              <Card className="gap-2">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Mujeres</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {activity.attendants?.filter((u) => u.userSex === 'F').length}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="gap-2">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Varones</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {activity.attendants?.filter((u) => u.userSex === 'M').length}
                </CardContent>
              </Card>
              <Card className="gap-2">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Menores de 18 años</CardTitle>
                  <Baby className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {
                    activity.attendants?.filter(
                      (u) => getAge(u.userBirthDate) < 18,
                    ).length
                  }
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="gap-2">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>De 18 a 64 años</CardTitle>
                  <User className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {
                    activity.attendants?.filter((u) => {
                      const edad = getAge(u.userBirthDate)
                      return edad >= 18 && edad <= 64
                    }).length
                  }
                </CardContent>
              </Card>
              <Card className="gap-2">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>De 65 años a más</CardTitle>
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {
                    activity.attendants?.filter(
                      (u) => getAge(u.userBirthDate) > 64,
                    ).length
                  }
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
