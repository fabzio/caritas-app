import { useSession } from '@frontend/hooks/use-session'
import useGetScholarship from '@frontend/modules/education/pages/scholarship/hooks/use-get-scholarship'
import { useGetFairs } from '@frontend/modules/organization/pages/education/fair/hooks/use-get-fair'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { BookOpen, CalendarDays, FilePlus2 } from 'lucide-react'

export default function OrganizationDashboard() {
  const { data: session } = useSession()
  const organizationId = session?.session.activeOrganizationId

  const { data: scholarshipsData } = useGetScholarship(
    undefined,
    1,
    10,
    true,
    organizationId ?? undefined,
  )

  const { data: fairsData } = useGetFairs({
    currentPage: 1,
    pageSize: 10,
  })

  const activeScholarships =
    scholarshipsData?.data?.filter((s) => s.active).length || 0
  const totalScholarships = scholarshipsData?.total || 0
  const totalFairs = fairsData?.total || 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold leading-tight">
          Panel de Organización
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus becas y ferias vocacionales
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Mi Organización</CardTitle>
            <CardDescription>Información de cuenta</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/50">
              <span className="font-medium text-foreground">
                {session?.user.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {session?.user.email}
              </span>
            </div>
            <Separator />
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">Rol</span>
              <Badge variant="secondary">Organización Aliada</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mis Becas
            </CardTitle>
            <CardDescription>Becas de tu organización</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex justify-around">
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">{totalScholarships}</span>
              </div>
              <Separator orientation="vertical" />
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Activas</span>
                <span className="text-2xl font-bold">{activeScholarships}</span>
              </div>
            </div>
            <Separator />
            <Button asChild className="w-full">
              <Link to="/organization/education/scholarship">
                Ver todas las becas
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Mis Ferias
            </CardTitle>
            <CardDescription>Ferias vocacionales</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex justify-around">
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">{totalFairs}</span>
              </div>
            </div>
            <Separator />
            <Button asChild className="w-full">
              <Link to="/organization/education/fair">
                Ver todas las ferias
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acceso Rápido</CardTitle>
          <CardDescription>
            Acciones frecuentes para tu organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start"
            >
              <Link to="/organization/education/scholarship">
                <div className="flex items-center gap-3 w-full">
                  <BookOpen className="h-6 w-6 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Ver Mis Becas</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Gestionar convocatorias
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start"
            >
              <Link to="/organization/education/fair">
                <div className="flex items-center gap-3 w-full">
                  <CalendarDays className="h-6 w-6 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Ver Mis Ferias</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Registrar asistencias
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start"
            >
              <Link
                to="/organization/education/scholarship/report"
                search={{ type: 'new' }}
              >
                <div className="flex items-center gap-3 w-full">
                  <FilePlus2 className="h-6 w-6 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Crear Reporte</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Reporte de beca
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
