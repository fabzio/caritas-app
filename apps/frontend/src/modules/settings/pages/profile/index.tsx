import { Separator } from '@workspace/ui/components/separator'
import HealthDetails from './components/health-details'
import PersonalDetails from './components/personal-details'
import StudentDetails from './components/student-details'

export default function Profile() {
  return (
    <>
      <h1 className="text-2xl font-medium">Datos Personales</h1>
      <Separator />
      <PersonalDetails />
      <h1 className="text-2xl font-medium">Datos de Estudiante</h1>
      <Separator />
      <StudentDetails />
      <h1 className="text-2xl font-medium">Datos de Salud</h1>
      <Separator />
      <HealthDetails />
    </>
  )
}
