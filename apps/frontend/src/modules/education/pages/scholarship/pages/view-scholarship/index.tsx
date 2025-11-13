import { ScholarshipReportsTable } from '@frontend/modules/education/components/scholarship-reports/components/reports-table'
import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  FileTextIcon,
  GraduationCapIcon,
} from 'lucide-react'
import { useState } from 'react'
import ApplicantsTable from './components/applicants-table'
import ScholarshipGeneralInfo from './components/scholarship-general-info'
import useScholarshipDetail from './hooks/use-scholarship-detail'

export default function ViewScholarship() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')

  const { data: scholarship } = useScholarshipDetail()

  if (!scholarship) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Beca no encontrada</p>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/education/scholarship' })}
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

  const scholarshipData = {
    type: scholarship.type === 'ML' ? 'Modular' : 'Plan de estudios',
    organization: scholarship.organization?.name || 'N/A',
    vacancies: scholarship.vacancies,
    startDate: scholarship.startDate,
    endDate: scholarship.endDate,
    description: scholarship.description,
    requirements: scholarship.requirements,
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            {scholarship.name}
          </h1>
          <Badge variant={scholarship.active ? 'default' : 'secondary'}>
            {scholarship.active ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        <Separator />
      </div>

      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/education/scholarship' })}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Regresar
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="applicants" className="flex items-center gap-2">
            <GraduationCapIcon className="h-4 w-4" />
            Postulantes
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <AlertTriangleIcon className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0">
          <div className="px-6">
            <ScholarshipGeneralInfo scholarship={scholarshipData} />
          </div>
        </TabsContent>

        <TabsContent value="applicants" className="mt-0">
          <div className="px-6">
            <ApplicantsTable scholarshipId={scholarship.id} />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <div className="px-6">
            <ScholarshipReportsTable scholarshipId={scholarship.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
