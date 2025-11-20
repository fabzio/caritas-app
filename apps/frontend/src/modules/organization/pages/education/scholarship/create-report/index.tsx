import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Separator } from '@workspace/ui/components/separator'
import { Spinner } from '@workspace/ui/components/spinner'
import { Textarea } from '@workspace/ui/components/textarea'
import { Eraser } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AutoCompleteAcceptedUser } from '../../components/autocomplete-accept'
import {
  type AcceptedUser,
  useAcceptedUsers,
} from '../../hooks/use-accept-applications'
import { useCreateReport } from './hooks/use-create-report'
import type { FormReportSchema } from './model/report'
import { reportSchema } from './model/report'
export default function CreateReportPage() {
  const search = useSearch({
    from: '/_authenticated/organization/education/scholarship/report',
  })
  const scholarshipId = Number(search.id)
  const navigate = useNavigate()
  const { data: session } = useSession()
  const reportedBy = session?.session?.userId ?? ''

  const [searchValue, setSearchValue] = useState('')
  const [selectedUser, setSelectedUser] = useState<AcceptedUser | null>(null)

  const { data: acceptedUsers = [], isLoading } = useAcceptedUsers({
    scholarshipId,
    name: searchValue,
  })
  const { mutate: createReport, isPending } = useCreateReport()
  // 🧾 Formulario
  const form = useForm<FormReportSchema>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      userId: '',
      cause: 'absence',
      causeDetail: '',
      reason: '',
      reasonDetail: '',
    },
  })

  const handleSelectUser = (user: AcceptedUser) => {
    setSelectedUser(user)
    form.setValue('userId', user.id)
  }

  const handleClear = () => {
    setSelectedUser(null)
    setSearchValue('')
    form.setValue('userId', '')
  }

  const handleCancel = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
      return
    }
    navigate({ to: '/organization/education/scholarship' })
  }

  const onSubmit = async (values: FormReportSchema) => {
    if (!reportedBy) return
    if (!selectedUser) return
    console.log({
      scholarshipId,
      userId: values.userId,
      reportedBy,
      cause: values.cause as 'absence' | 'performance' | 'other',
      causeDetail: values.causeDetail,
      reason: values.reason,
      reasonDetail: values.reasonDetail,
    })
    createReport({
      scholarshipId,
      userId: values.userId,
      reportedBy,
      cause: values.cause as 'absence' | 'performance' | 'other',
      causeDetail: values.causeDetail,
      reason: values.reason,
      reasonDetail: values.reasonDetail,
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Crear Reporte de Beca
        </h1>
        <span className="text-muted-foreground">
          Completa los campos para registrar un reporte asociado a la beca
          seleccionada.
        </span>
        <Separator />
      </div>

      <div className="flex justify-center">
        <div className="w-full lg:w-3/4">
          <header>
            <h3 className="text-lg font-medium">Información del reporte</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Identifica al alumno y describe la causa y razón del reporte.
            </p>
          </header>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Alumno */}
              <FormField
                control={form.control}
                name="userId"
                render={() => (
                  <FormItem>
                    <FormLabel>Nombre del Alumno*</FormLabel>
                    <FormControl>
                      <div className="flex flex-row gap-2 items-center">
                        <div className="flex-1">
                          <AutoCompleteAcceptedUser
                            options={acceptedUsers}
                            emptyMessage="No se encontraron alumnos aceptados."
                            isLoading={isLoading}
                            placeholder="Buscar alumno por nombre o correo..."
                            value={selectedUser}
                            nonSelectedValue={searchValue}
                            onValueChange={(user) => handleSelectUser(user)}
                            onInputChange={setSearchValue}
                          />
                        </div>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={handleClear}
                          disabled={!selectedUser}
                        >
                          <Eraser className="w-4 h-4 mr-2" />
                          Limpiar
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cause"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Causa*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una causa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="absence">Inasistencias</SelectItem>
                        <SelectItem value="performance">
                          Rendimiento académico
                        </SelectItem>
                        <SelectItem value="other">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Detalle de causa */}
              <FormField
                control={form.control}
                name="causeDetail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalle de la causa*</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe la causa con más detalle..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Razón */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: Bajo rendimiento académico"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Detalle de razón */}
              <FormField
                control={form.control}
                name="reasonDetail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalle de la razón*</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe la razón con más detalle..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Footer */}
              <footer className="flex justify-end gap-4 items-center pt-4">
                <Button variant="outline" type="button" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !selectedUser}>
                  {isPending ? <Spinner /> : 'Registrar reporte'}
                </Button>
              </footer>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
