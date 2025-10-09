import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Separator } from '@workspace/ui/components/separator'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import usePostSpeciality from './hooks/use-post-speciality'
import {
  type FormSpecialitySchema,
  formSpecialitySchema,
} from './models/speciality'

export default function CreateSpeciality() {
  const form = useForm<FormSpecialitySchema>({
    resolver: zodResolver(formSpecialitySchema),
    defaultValues: {
      name: '',
    },
  })

  const { mutate, isPending } = usePostSpeciality()
  const { data: user } = useSession()

  const handleSubmit = form.handleSubmit((data) => {
    if (!user) return
    const params = { ...data, createdBy: user.user.id, active: true }
    mutate(params)
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Registrar Nueva Especialidad
        </h1>
        <span className="text-muted-foreground">
          Complete la información de la especialidad
        </span>
        <Separator />
      </div>
      <div>
        <div className=" flex justify-center ">
          <Card className="w-full lg:w-3/4">
            <CardHeader>
              <CardTitle>Información de la Especialidad</CardTitle>
              <CardDescription>Complete el campo requerido</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Especialidad</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CardFooter className="flex justify-end gap-4 ">
                    <Link to="/health/speciality">
                      <Button className="mt-2" variant="outline">
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      className="mt-2 col-span-2"
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin w-2" />
                      ) : (
                        'Registrar'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
