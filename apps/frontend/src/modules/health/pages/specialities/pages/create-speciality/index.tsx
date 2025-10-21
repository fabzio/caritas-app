import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, Link, useSearch } from '@tanstack/react-router'
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
import usePostSpeciality from '../../hooks/use-post-speciality'
import useUpdateSpeciality from '../../hooks/use-update-speciality'
import {
  type FormSpecialitySchema,
  formSpecialitySchema,
} from '../../models/speciality'

export default function FormView() {
  const viewType = useSearch({
    from: '/_authenticated/health/specialities/form',
    select: (s) => s.type,
  })

  const loaderData = getRouteApi(
    '/_authenticated/health/specialities/form',
  ).useLoaderData()

  const { data: user } = useSession()
  const { mutate: createSpeciality, isPending: isCreating } =
    usePostSpeciality()
  const { mutate: updateSpeciality, isPending: isUpdating } =
    useUpdateSpeciality()

  const form = useForm<FormSpecialitySchema>({
    resolver: zodResolver(formSpecialitySchema),
    defaultValues:
      viewType === 'edit'
        ? {
            name: loaderData?.name ?? '',
          }
        : {
            name: '',
          },
  })

  const handleSubmit = form.handleSubmit((data) => {
    if (!user) return

    if (viewType === 'edit' && loaderData?.id) {
      updateSpeciality({
        id: loaderData.id,
        name: data.name,
      })
    } else {
      const params = { ...data, createdBy: user.user.id, active: true }
      createSpeciality(params)
    }
  })

  const submitLabel = viewType === 'edit' ? 'Guardar Cambios' : 'Registrar'

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {viewType === 'edit'
            ? 'Editar Especialidad'
            : 'Registrar Nueva Especialidad'}
        </h1>
        <span className="text-muted-foreground">
          {viewType === 'edit'
            ? 'Actualiza el nombre de la especialidad'
            : 'Complete la información de la especialidad'}
        </span>
        <Separator />
      </div>
      <div>
        <div className="flex justify-center">
          <Card className="w-full lg:w-3/4">
            <CardHeader>
              <CardTitle>Información de la Especialidad</CardTitle>
              <CardDescription>
                {viewType === 'edit'
                  ? 'Modifique el campo requerido'
                  : 'Complete el campo requerido'}
              </CardDescription>
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
                    <Link to="/health/specialities">
                      <Button className="mt-2" variant="outline">
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      className="mt-2 col-span-2"
                      type="submit"
                      disabled={isCreating || isUpdating}
                    >
                      {isCreating || isUpdating ? (
                        <Loader2 className="animate-spin w-2" />
                      ) : (
                        submitLabel
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
