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

export default function ScholarshipGeneralInfo({ scholarship }: Props) {
  return (
    <div className="space-y-6">
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
