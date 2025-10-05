import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, MapPin } from 'lucide-react'

type ScolarshipCardProps = {
  scholarship: {
    id: number
    name: string
    vacancies: number
    startDate: string
    endDate: string
    organization?: {
      name: string
      address?: string
    }
    type: string
  }
}

export function ScholarshipCard({ scholarship }: ScolarshipCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{scholarship.name}</CardTitle>
          <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground min-w-12">
            {scholarship.vacancies}
          </div>
        </div>
        <Badge variant="secondary" className="w-fit uppercase text-xs">
          {scholarship.organization?.name || 'Sin organización'}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>Fecha Inicio:</span>
          <span className="font-medium text-foreground">
            {format(new Date(scholarship.startDate), 'dd/MM/yy', {
              locale: es,
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>Ubicación:</span>
          <span className="font-medium text-foreground line-clamp-1">
            {scholarship.organization?.address || 'Lima'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>Fecha Fin:</span>
          <span className="font-medium text-foreground">
            {format(new Date(scholarship.endDate), 'dd/MM/yy', {
              locale: es,
            })}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Link
          to="/education/scholarship/$id"
          params={{ id: String(scholarship.id) }}
          className="w-full"
        >
          <Button variant="outline" className="w-full">
            Ver detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
