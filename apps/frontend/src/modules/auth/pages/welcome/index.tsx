import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import WelcomeOrgStepper from './components/organization-stepper'
import WelcomePersonStepper from './components/person-stepper'

export default function Welcome() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">
        ¡Gracias por unirte a nosotros!
      </h1>
      <p>
        Queremos conocer un poco más sobre usted para brindarle la mejor
        experiencia
      </p>
      <Tabs defaultValue="person">
        <TabsList>
          <TabsTrigger value="organization">Organización</TabsTrigger>
          <TabsTrigger value="person">Usuario</TabsTrigger>
        </TabsList>
        <TabsContent value="organization">
          <WelcomeOrgStepper />
        </TabsContent>
        <TabsContent value="person">
          <WelcomePersonStepper />
        </TabsContent>
      </Tabs>
    </div>
  )
}
