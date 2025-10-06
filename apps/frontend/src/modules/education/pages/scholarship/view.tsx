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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { FileTextIcon, GraduationCapIcon } from 'lucide-react'
import ApplicantsTable, {
  type Applicant,
} from '../../components/applicants-table'
import ScholarshipGeneralInfo from '../../components/scholarship-general-info'

export default function ViewScholarship() {
  const mockApplicants: Applicant[] = [
    {
      id: 1,
      name: 'Ana García',
      email: 'ana.garcia@example.com',
      status: 'approved',
      applicationDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos.lopez@example.com',
      status: 'pending',
      applicationDate: '2024-01-16',
    },
    {
      id: 3,
      name: 'María Rodriguez',
      email: 'maria.rodriguez@example.com',
      status: 'approved',
      applicationDate: '2024-01-17',
    },
    {
      id: 4,
      name: 'Pedro Martínez',
      email: 'pedro.martinez@example.com',
      status: 'rejected',
      applicationDate: '2024-01-18',
    },
    {
      id: 5,
      name: 'Laura Sánchez',
      email: 'laura.sanchez@example.com',
      status: 'approved',
      applicationDate: '2024-01-19',
    },
  ]

  const mockScholarship = {
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
        <h1 className="text-2xl font-semibold text-foreground">
          Detalles de la Beca
        </h1>
        <Separator />
      </div>

      <div className="flex justify-center">
        <Card className="w-full lg:w-3/4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Nombre de la Beca</CardTitle>
                <CardDescription>
                  Beca activa desde {new Date().toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="default">Activa</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2"
                >
                  <FileTextIcon className="h-4 w-4" />
                  Información General
                </TabsTrigger>
                <TabsTrigger
                  value="applicants"
                  className="flex items-center gap-2"
                >
                  <GraduationCapIcon className="h-4 w-4" />
                  Postulantes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <ScholarshipGeneralInfo scholarship={mockScholarship} />
              </TabsContent>

              <TabsContent value="applicants" className="space-y-6">
                <ApplicantsTable applicants={mockApplicants} />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline">Volver</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
