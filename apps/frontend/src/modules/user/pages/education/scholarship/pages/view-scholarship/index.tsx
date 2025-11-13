import { useNavigate, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { ArrowLeftIcon } from 'lucide-react'
import ScholarshipGeneralInfo from '../../../../../components/scholarship-general-info'
import useScholarshipStore from './hooks/use-scholarship-store'

export default function ViewScholarshipPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const { getScholarshipById } = useScholarshipStore()

  const scholarship = getScholarshipById(Number.parseInt(id ?? '0', 10))

  if (!scholarship) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Beca no encontrada</p>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/user/education/scholarship' })}
              className="mt-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a Becas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const scholarshipData = {
    type: scholarship.type === 'ML' ? 'Modular' : 'Plan de estudios',
    organization: scholarship.organization?.name || 'N/A',
    vacancies: scholarship.vacancies,
    startDate: formatDate(scholarship.startDate),
    endDate: formatDate(scholarship.endDate),
    description: scholarship.description,
    requirements: scholarship.requirements,
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {scholarship.name}
        </h1>
        <Separator />
      </div>

      <Card>
        <CardContent className="px-6">
          <ScholarshipGeneralInfo scholarship={scholarshipData} />
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/user/education/scholarship' })}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a Becas
        </Button>
      </div>
    </div>
  )
}
