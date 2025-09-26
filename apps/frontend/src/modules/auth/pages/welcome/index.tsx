import { Button } from '@workspace/ui/components/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import Organization from './components/organization'
import Person from './components/person'

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
          <Organization />
        </TabsContent>
        <TabsContent value="person">
          <Person />
        </TabsContent>
      </Tabs>
      <div className="mt-4 w-full flex justify-end">
        <Button>Continuar</Button>
      </div>
    </div>
  )
}
