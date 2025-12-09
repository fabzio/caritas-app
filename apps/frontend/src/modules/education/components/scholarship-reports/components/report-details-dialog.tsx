import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from '@workspace/ui/components/separator'
import { Spinner } from '@workspace/ui/components/spinner'
import { Textarea } from '@workspace/ui/components/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ScholarshipReport } from '../hooks/use-scholarship-reports'
import { useUpdateReportReason } from '../hooks/use-update-report-reason'
import { causeLabels } from './columns'

type Props = {
  report?: ScholarshipReport | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const reasonSchema = z.object({
  reason: z.string().trim().min(1, 'El motivo es requerido'),
  reasonDetail: z
    .string()
    .trim()
    .min(3, 'El detalle debe tener al menos 3 caracteres'),
})

type ReasonFormSchema = z.infer<typeof reasonSchema>

export function ReportDetailsDialog({
  report,
  open,
  onOpenChange,
}: Readonly<Props>) {
  const { mutate: updateReason, isPending } = useUpdateReportReason()

  const form = useForm<ReasonFormSchema>({
    resolver: zodResolver(reasonSchema),
    defaultValues: {
      reason: '',
      reasonDetail: '',
    },
  })

  const hasReason = Boolean(report?.reason?.name)

  const onSubmit = (values: ReasonFormSchema) => {
    if (!report) return

    updateReason(
      {
        reportId: report.id,
        reason: values.reason,
        reasonDetail: values.reasonDetail,
      },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      },
    )
  }

  if (!report) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle del reporte</DialogTitle>
          <DialogDescription>
            Información registrada el{' '}
            {new Date(report.createdAt).toLocaleDateString('es-PE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Beca
            </h4>
            <p>{report.scholarship.name}</p>
          </section>

          <Separator />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">
                Becado
              </h4>
              <p className="font-medium">{report.student.name}</p>
              <p className="text-sm text-muted-foreground">
                {report.student.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {report.student.phone}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">
                Registrado por
              </h4>
              <p className="font-medium">
                {report.reportedBy.name ?? 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                {report.reportedBy.email ?? 'Sin correo'}
              </p>
            </div>
          </section>

          <Separator />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">
                Causa
              </h4>
              <p className="font-medium">{causeLabels[report.cause]}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {report.causeDetail || 'Sin detalle'}
              </p>
            </div>

            {hasReason && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  Motivo
                </h4>
                <p className="font-medium">{report.reason.name}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {report.reasonDetail || 'Sin detalle'}
                </p>
              </div>
            )}
          </section>

          {!hasReason && (
            <>
              <Separator />

              <section>
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">
                  Motivo
                </h4>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo*</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ej: Exceso de faltas"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reasonDetail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detalle del motivo*</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe el motivo con más detalle..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full"
                    >
                      {isPending ? <Spinner /> : 'Guardar motivo'}
                    </Button>
                  </form>
                </Form>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
