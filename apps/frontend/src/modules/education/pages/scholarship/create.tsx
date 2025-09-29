import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { Form, useForm } from 'react-hook-form'
import {
  type FormScholarShipSchema,
  formScholarShipSchema,
} from '../../models/scholarship'
export default function CreateScholarship() {
  const form = useForm<FormScholarShipSchema>({
    resolver: zodResolver(formScholarShipSchema),
    defaultValues: {
      name: '',
      organizationName: undefined,
      description: '',
      requirements: '',
      vacanties: 1,
      startOfDate: undefined,
      endOfDate: undefined,
      organizationId: undefined,
    },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Registrar nueva Beca
        </h1>
        <span className="text-muted-foreground">
          Complete la información de la beca
        </span>
        <Separator />
      </div>
      <div>
        <div className="w-full flex flex-col justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Beca</CardTitle>
              <CardDescription>
                Complete todos los campos requeridos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <CardFooter className="flex justify-end gap-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="default">Registrar</Button>
                </CardFooter>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
