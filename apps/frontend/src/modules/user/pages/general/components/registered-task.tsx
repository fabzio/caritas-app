import { Badge } from '@workspace/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle2, Circle } from 'lucide-react'
import { useMemo, useState } from 'react'

type ScheduledTask = {
  date: string
  startTime: string
  endTime: string
  title: string
  status: 'completada' | 'pendiente'
}

function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export default function RegisteredTasks() {
  const availableDates = useMemo(() => {
    const uniqueDates = Array.from(
      new Set(scheduledTasks.map((task) => task.date)),
    )
    return uniqueDates.sort(
      (a, b) => parseISO(a).getTime() - parseISO(b).getTime(),
    )
  }, [])

  const [selectedDate, setSelectedDate] = useState(
    () => availableDates[0] ?? '',
  )

  const tasksByDate = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    return scheduledTasks
      .filter((task) => task.date === selectedDate)
      .sort(
        (a, b) => minutesFromTime(a.startTime) - minutesFromTime(b.startTime),
      )
  }, [selectedDate])

  return (
    <Card className="mt-2 gap-4">
      <CardHeader>
        <CardTitle>Agenda programada</CardTitle>
        <CardDescription>
          Revisa las actividades planificadas para la semana y actualiza su
          avance.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Tabs value={selectedDate} onValueChange={setSelectedDate}>
          <TabsList className="w-full overflow-x-auto gap-2">
            {availableDates.map((date) => {
              const parsedDate = parseISO(date)
              const weekDay = format(parsedDate, 'EEE', { locale: es })
              const dayNumber = format(parsedDate, 'd', { locale: es })

              return (
                <TabsTrigger
                  key={date}
                  value={date}
                  className="flex min-w-16 flex-col items-center gap-1 px-3 py-2 text-sm"
                >
                  <span className="uppercase text-xs text-muted-foreground">
                    {weekDay}
                  </span>
                  <span className="text-base font-semibold">{dayNumber}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
        <div className="space-y-5">
          {tasksByDate.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No hay actividades programadas para esta fecha.
            </div>
          ) : (
            tasksByDate.map((task) => {
              const duration =
                minutesFromTime(task.endTime) - minutesFromTime(task.startTime)
              const StatusIcon =
                task.status === 'completada' ? CheckCircle2 : Circle

              return (
                <article
                  key={task.title}
                  className="grid grid-cols-[auto_1fr] items-start gap-4"
                >
                  <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                    <span>{task.startTime}</span>
                    <span>{task.endTime}</span>
                  </div>
                  <div className="relative flex flex-col gap-3 pl-4">
                    <div
                      className="absolute left-0 top-1 h-full border-l border-dashed border-border"
                      aria-hidden="true"
                    />
                    <div className="flex items-start gap-3">
                      <StatusIcon
                        className={
                          task.status === 'completada'
                            ? 'text-primary size-4'
                            : 'text-muted-foreground size-4'
                        }
                      />
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-semibold leading-tight">
                            {task.title}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{duration} minutos</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Estado:</span>
                          <span className="font-medium capitalize">
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const scheduledTasks: ScheduledTask[] = [
  {
    date: '2025-06-22',
    startTime: '08:00',
    endTime: '08:10',
    title: 'Campaña de Vacunación',
    status: 'completada',
  },
  {
    date: '2025-06-22',
    startTime: '08:30',
    endTime: '08:50',
    title: 'Feria de Salud',
    status: 'completada',
  },
  {
    date: '2025-06-22',
    startTime: '12:30',
    endTime: '13:10',
    title: 'Campaña de Donación de Sangre',
    status: 'pendiente',
  },
]
