import { useNavigate, useParams } from '@tanstack/react-router'
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
import { ArrowLeftIcon, FileTextIcon, GraduationCapIcon } from 'lucide-react'
import { useState } from 'react'
import ApplicantsTable from './components/applicants-table'
import ScholarshipGeneralInfo from './components/scholarship-general-info'

export default function ViewScholarship() {
  const { scholarshipId } = useParams({ strict: false })
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')

  const mockScholarship = {
    name: 'Beca de Excelencia Académica 2025',
    active: true,
    type: 'Plan de estudios',
    organization: 'Organización ejemplo',
    vacancies: 10,
    startDate: new Date().toLocaleDateString(),
    endDate: new Date().toLocaleDateString(),
    description:
      'Esta es una beca ejemplo que proporciona oportunidades educativas para estudiantes que cumplan con los requisitos establecidos. La beca cubre diferentes aspectos del proceso educativo.',
    requirements:
      'Los requisitos para aplicar a esta beca incluyen documentación académica, comprobantes de ingresos, y cumplir con los criterios de elegibilidad establecidos por la organización.',
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            {mockScholarship.name}
          </h1>
          <Badge variant={mockScholarship.active ? 'default' : 'secondary'}>
            {mockScholarship.active ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        <Separator />
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
        </TabsList>

        <TabsContent value="general" className="mt-0">
          <Card>
            <CardContent className="px-6">
              <ScholarshipGeneralInfo scholarship={mockScholarship} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicants" className="mt-0">
          <Card>
            <CardContent className="px-6">
              {scholarshipId ? (
                <ApplicantsTable
                  scholarshipId={Number.parseInt(scholarshipId, 10)}
                />
              ) : (
                'ID de beca no proporcionado'
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/education/scholarship' })}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a Becas
        </Button>
      </div>
    </div>
  )
}
