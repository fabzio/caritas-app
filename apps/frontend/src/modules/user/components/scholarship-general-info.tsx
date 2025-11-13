import { Separator } from '@workspace/ui/components/separator'
import {
  BuildingIcon,
  CalendarIcon,
  FileTextIcon,
  UsersIcon,
} from 'lucide-react'

type ScholarshipData = {
  type: string
  organization: string
  vacancies: number
  startDate: string
  endDate: string
  description: string
  requirements: string
}

type Props = {
  scholarship: ScholarshipData
}

function parseDateFromDDMMYYYY(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number)
  return new Date(year, month - 1, day)
}

function getScholarshipStatus(startDate: string, endDate: string) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const start = parseDateFromDDMMYYYY(startDate)
  const end = parseDateFromDDMMYYYY(endDate)

  if (now < start) {
    const daysUntilStart = Math.ceil(
      (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )
    return {
      type: 'upcoming' as const,
      message: `Faltan ${daysUntilStart} días`,
      subMessage: 'para que inicie',
      days: daysUntilStart,
    }
  }

  if (now >= start && now <= end) {
    const daysRemaining = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )
    return {
      type: 'active' as const,
      message: `${daysRemaining} días restantes`,
      subMessage: 'para postular',
      days: daysRemaining,
    }
  }

  return {
    type: 'ended' as const,
    message: 'Finalizada',
    days: 0,
  }
}

export default function ScholarshipGeneralInfo({
  scholarship,
}: Readonly<Props>) {
  const status = getScholarshipStatus(
    scholarship.startDate,
    scholarship.endDate,
  )

  return (
    <div className="space-y-6">
      <div
        className={`rounded-lg border-2 p-6 text-center ${
          status.type === 'active'
            ? 'border-primary bg-primary/10'
            : status.type === 'upcoming'
              ? 'border-accent bg-accent/10'
              : 'border-muted bg-muted/50'
        }`}
      >
        <p
          className={`text-2xl font-semibold ${
            status.type === 'active'
              ? 'text-primary'
              : status.type === 'upcoming'
                ? 'text-accent-foreground'
                : 'text-muted-foreground'
          }`}
        >
          {status.message}
        </p>
        {status.subMessage && (
          <p className="mt-1 text-sm text-muted-foreground">
            {status.subMessage}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileTextIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Tipo de Beca</h3>
              <p className="text-sm text-muted-foreground">
                {scholarship.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BuildingIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Organización</h3>
              <p className="text-sm text-muted-foreground">
                {scholarship.organization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UsersIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Vacantes</h3>
              <p className="text-sm text-muted-foreground">
                {scholarship.vacancies} disponibles
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Fecha de Inicio</h3>
              <p className="text-sm text-muted-foreground">
                {scholarship.startDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Fecha de Fin</h3>
              <p className="text-sm text-muted-foreground">
                {scholarship.endDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-medium">Descripción</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {scholarship.description}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">Requisitos</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {scholarship.requirements}
        </p>
      </div>
    </div>
  )
}
