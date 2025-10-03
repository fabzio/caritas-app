import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { useOrganization } from '../../../../admin/pages/dashboard/hooks/use-organization'
import AlliesTable from '../components/allies-table'
import { useHealthOrganization } from '../hooks/use-health-organization'

export default function ViewOrganizations() {
  const { data } = useHealthOrganization()
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Aliados</h1>
      </div>
      <div className="w-full flex gap-8">
        <Card className="max-w-lg shadow-lg">
          <CardHeader>
            <Button>Registrar aliado</Button>
          </CardHeader>
          <CardContent className="px-1">
            <AlliesTable allies={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
