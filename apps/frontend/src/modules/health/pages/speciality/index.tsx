import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { PlusCircle } from 'lucide-react'
import useGetSpeciality from '../../hooks/use-get-speciality'

export default function SpecialityPage() {
  const isMobile = useIsMobile()
  const { data: specialities, isLoading, isError } = useGetSpeciality()

  const displaySpecialities = specialities ?? []

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Administración de especialidades
        </h1>
      </div>
      <div>
        <div className="w-full flex justify-end mb-6">
          <Link to="/health/speciality/create">
            <Button className="w-full max-w-xs" size={isMobile ? 'sm' : 'lg'}>
              <PlusCircle />
              Registrar nueva especialidad
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-6" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              <p>Error al cargar las becas. Intente de nuevo.</p>
            </CardContent>
          </Card>
        )}

        {/* En caso no hayan especialidades */}
        {!isLoading &&
          displaySpecialities &&
          displaySpecialities.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No hay especialidades registradas aún.</p>
              </CardContent>
            </Card>
          )}

        {!isLoading &&
          displaySpecialities &&
          displaySpecialities.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displaySpecialities.map((speciality) => (
                <p key={speciality.id}>{speciality.name}</p>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
