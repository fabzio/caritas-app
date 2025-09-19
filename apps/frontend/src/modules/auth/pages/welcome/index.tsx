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
      <h1 className="text-2xl font-semibold">Le damos la bienvenida</h1>
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
    </div>
  )
}
