import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Separator } from '@workspace/ui/components/separator'
import { Spinner } from '@workspace/ui/components/spinner'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useUpdateFairAttendance } from '../../hooks/use-update-fair-attendance'
import {
  type AttendanceSchema,
  attendanceSchema,
} from './utils/attendance-schema'

export default function FairAttendancePage() {
  const loaderData = getRouteApi(
    '/_authenticated/organization/education/fair/$id/attendance',
  ).useLoaderData()
  const params = getRouteApi(
    '/_authenticated/organization/education/fair/$id/attendance',
  ).useParams()

  const form = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      externalAssistance: '',
      fourthGradeAssistance:
        loaderData?.fourthGradeAssistance !== null &&
        loaderData?.fourthGradeAssistance !== undefined
          ? String(loaderData.fourthGradeAssistance)
          : '',
      fifthGradeAssistance:
        loaderData?.fifthGradeAssistance !== null &&
        loaderData?.fifthGradeAssistance !== undefined
          ? String(loaderData.fifthGradeAssistance)
          : '',
    },
  })

  const { mutate: updateAttendance, isPending } = useUpdateFairAttendance()

  const handleSubmit = form.handleSubmit((data) => {
    const fourth =
      data.fourthGradeAssistance && data.fourthGradeAssistance.trim() !== ''
        ? Number(data.fourthGradeAssistance)
        : null
    const fifth =
      data.fifthGradeAssistance && data.fifthGradeAssistance.trim() !== ''
        ? Number(data.fifthGradeAssistance)
        : null
    const external =
      data.externalAssistance && data.externalAssistance.trim() !== ''
        ? Number(data.externalAssistance)
        : null

    const gradeSum = (fourth || 0) + (fifth || 0) + (external || 0)
    const calculatedTotal = gradeSum > 0 ? gradeSum : null

    const normalizedData = {
      id: Number(params.id),
      assistanceCount: calculatedTotal,
      fourthGradeAssistance: fourth,
      fifthGradeAssistance: fifth,
    }

    updateAttendance(normalizedData)
  })

  if (!loaderData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/organization/education/fair">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">
            Actualizar Asistencia
          </h1>
        </div>
        <span className="text-muted-foreground ml-12">
          Registre la asistencia de la feria vocacional
        </span>
        <Separator />
      </div>

      <div className="flex justify-center">
        <div className="w-full lg:w-3/4">
          <header className="mb-6">
            <h3 className="text-lg font-medium">{loaderData.title}</h3>
            <p className="text-sm text-muted-foreground">
              Fecha:{' '}
              {new Date(loaderData.date).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </header>

          <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <FormField
                control={form.control}
                name="fourthGradeAssistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Asistentes de Cuarto Grado de Secundaria
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Ingrese el número de estudiantes de 4to grado"
                      />
                    </FormControl>
                    <FormDescription>
                      Número de estudiantes de cuarto grado (no incluye
                      externos)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fifthGradeAssistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Asistentes de Quinto Grado de Secundaria
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Ingrese el número de estudiantes de 5to grado"
                      />
                    </FormControl>
                    <FormDescription>
                      Número de estudiantes de quinto grado (no incluye
                      externos)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="externalAssistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Asistentes Externos (Otros)
                      <span className="text-muted-foreground text-sm font-normal ml-1">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Ingrese el número de asistentes externos"
                      />
                    </FormControl>
                    <FormDescription>
                      Asistentes que no son estudiantes de 4to o 5to grado de
                      secundaria
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" type="button" asChild>
                  <Link to="/organization/education/fair">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner />}
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
