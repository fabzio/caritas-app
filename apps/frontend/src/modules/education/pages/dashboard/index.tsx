import { useSession } from '@frontend/hooks/use-session'
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
import { BookOpen, CalendarDays, Handshake, Users } from 'lucide-react'
import { useListBeneficiaries } from '../beneficiaries/hooks/use-list-beneficiaries'
import { useGetFairs } from '../fair/hooks/use-get-fair'
import useGetScholarship from '../scholarship/hooks/use-get-scholarship'

export default function EducationDashboard() {
  const { data: session } = useSession()
  const { data: scholarshipsData } = useGetScholarship(undefined, 1, 10, true)
  const { data: fairsData } = useGetFairs({
    currentPage: 1,
    pageSize: 10,
  })
  const { data: beneficiariesData } = useListBeneficiaries({
    currentPage: 1,
    pageSize: 10,
  })

  const activeScholarships =
    scholarshipsData?.data?.filter((s) => s.active).length || 0
  const totalScholarships = scholarshipsData?.total || 0
  const totalFairs = fairsData?.total || 0
  const totalBeneficiaries = beneficiariesData?.total || 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold leading-tight">Panel de Educación</h1>
        <p className="text-muted-foreground">
          Gestiona becas, ferias, beneficiarios y organizaciones aliadas
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* User Info Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Mi Cuenta</CardTitle>
            <CardDescription>Información de usuario</CardDescription>
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
              <span className="text-sm text-muted-foreground">Equipo</span>
              <Badge variant="secondary">Educación</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Scholarships Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Becas
            </CardTitle>
            <CardDescription>Gestión de becas educativas</CardDescription>
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
                <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                  {activeScholarships}
                </span>
              </div>
            </div>
            <Separator />
            <Button asChild className="w-full">
              <Link to="/education/scholarship">Ver todas las becas</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Fairs Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Ferias
            </CardTitle>
            <CardDescription>Eventos y ferias educativas</CardDescription>
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
              <Link to="/education/fair">Ver todas las ferias</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Beneficiaries Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Beneficiarios
            </CardTitle>
            <CardDescription>
              Personas registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex justify-around">
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">{totalBeneficiaries}</span>
              </div>
            </div>
            <Separator />
            <Button asChild className="w-full">
              <Link to="/education/beneficiaries">
                Ver todos los beneficiarios
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acceso Rápido</CardTitle>
          <CardDescription>
            Acciones frecuentes del módulo de educación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-auto p-4 justify-start"
            >
              <Link to="/education/scholarship/form" search={{ type: 'new' }}>
                <div className="flex items-center gap-3 w-full">
                  <BookOpen className="h-6 w-6 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Crear Beca</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Nueva convocatoria
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
              <Link to="/education/fair/form" search={{ type: 'new' }}>
                <div className="flex items-center gap-3 w-full">
                  <CalendarDays className="h-6 w-6 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Crear Feria</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Nuevo evento
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
              <Link to="/education/beneficiaries/form" search={{ type: 'new' }}>
                <div className="flex items-center gap-3 w-full">
                  <Users className="h-6 w-6 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Registrar Beneficiario</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Nueva persona
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
              <Link to="/education/organization" search={{ action: 'create' }}>
                <div className="flex items-center gap-3 w-full">
                  <Handshake className="h-6 w-6 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Registrar Aliado</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Nueva organización
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
