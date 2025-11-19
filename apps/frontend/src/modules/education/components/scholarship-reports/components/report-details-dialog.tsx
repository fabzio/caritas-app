import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Separator } from '@workspace/ui/components/separator'
import type { ScholarshipReport } from '../hooks/use-scholarship-reports'
import { causeLabels } from './columns'

type Props = {
  report?: ScholarshipReport | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDetailsDialog({
  report,
  open,
  onOpenChange,
}: Readonly<Props>) {
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
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">
                Motivo
              </h4>
              <p className="font-medium">
                {report.reason.name ?? 'Sin motivo'}
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {report.reasonDetail || 'Sin detalle'}
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
