import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { PlusCircle } from 'lucide-react'
import { ScholarshipCard } from '../../components/scolarship-card'
import useGetScholarship from '../../hooks/use-get-scholarship'

// just to test the ui
const DUMMY_SCHOLARSHIPS = [
  {
    id: '1',
    name: 'Beca de Excelencia Académica',
    description: 'Beca destinada a estudiantes con alto rendimiento académico.',
    vacancies: 500,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    createdAt: '2024-10-01',
  },
  {
    id: '2',
    name: 'Beca de Apoyo Económico',
    description: 'Apoyo para familias de escasos recursos.',
    vacancies: 250,
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    createdAt: '2024-09-15',
  },
  {
    id: '3',
    name: 'Beca de Educación Superior',
    description: 'Beca para estudiantes universitarios destacados.',
    vacancies: 750,
    startDate: '2025-03-01',
    endDate: '2025-12-15',
    createdAt: '2024-08-20',
  },
  {
    id: '4',
    name: 'Beca Deportiva',
    description: 'Para estudiantes atletas con talento.',
    vacancies: 0,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-05',
  },
]

export default function ScholarshipPage() {
  const isMobile = useIsMobile()
  const { data: scholarships, isLoading, isError } = useGetScholarship()

  const displayScholarships = DUMMY_SCHOLARSHIPS

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Administración de becas
        </h1>
      </div>
      <div>
        <div className="w-full flex justify-end mb-6">
          <Link to="/education/scholarship/create">
            <Button className="w-full max-w-xs" size={isMobile ? 'sm' : 'lg'}>
              <PlusCircle />
              Registrar nueva beca
            </Button>
          </Link>
        </div>
        {/* lista de becas en formato desktop y mobile(priori) */}
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
        {/* en caso no hayan becas */}
        {!isLoading &&
          displayScholarships &&
          displayScholarships.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No hay becas registradas aún.</p>
              </CardContent>
            </Card>
          )}
        {!isLoading &&
          displayScholarships &&
          displayScholarships.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayScholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
