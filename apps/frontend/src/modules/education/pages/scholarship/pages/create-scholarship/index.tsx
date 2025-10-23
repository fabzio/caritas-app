import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, Link, useSearch } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Separator } from '@workspace/ui/components/separator'
import { Textarea } from '@workspace/ui/components/textarea'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useGetOrganization from './hooks/use-get-organization'
import usePostScholarship from './hooks/use-post-scholarship'
import { useUpdateScholarship } from './hooks/use-update-scholarship'
import {
  type FormScholarShipSchema,
  formScholarShipSchema,
} from './models/scholarship'
export default function CreateScholarship() {
  const viewType = useSearch({
    from: '/_authenticated/education/scholarship/form',
    select: (search) => search.type,
  })
  const loaderData = getRouteApi(
    '/_authenticated/education/scholarship/form',
  ).useLoaderData()

  const form = useForm<FormScholarShipSchema>({
    resolver: zodResolver(formScholarShipSchema),
    defaultValues:
      viewType === 'edit'
        ? {
            name: loaderData?.name,
            description: loaderData?.description,
            requirements: loaderData?.requirements,
            vacancies: loaderData?.vacancies,
            startDate: loaderData?.startDate
              ? new Date(loaderData.startDate)
              : undefined,
            endDate: loaderData?.endDate
              ? new Date(loaderData.endDate)
              : undefined,
            organizationId: loaderData?.organizationId
              ? String(loaderData.organizationId)
              : undefined,
            type: loaderData?.type,
          }
        : {
            name: '',
            description: '',
            requirements: '',
            vacancies: undefined,
            startDate: undefined,
            endDate: undefined,
            organizationId: undefined,
            type: undefined,
          },
  })
  const today = new Date()
  const { data: organizations, isLoading } = useGetOrganization()
  const { mutate: createScholarship, isPending: isPendingCreate } =
    usePostScholarship()
  const { mutate: updateScholarship, isPending: isPendingUpdate } =
    useUpdateScholarship()

  const { data: user } = useSession()
  const handleSubmit = form.handleSubmit((data) => {
    if (!user || form.getValues('vacancies') == null) return
    if (viewType === 'edit' && loaderData?.id) {
      const params = { ...data, id: loaderData.id }
      updateScholarship(params)
    } else {
      const params = { ...data, createdBy: user.user.id, active: true }
      createScholarship(params)
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {dependantText.mainTitle[viewType] || 'Crear nueva beca'}
        </h1>
        <span className="text-muted-foreground">
          Complete la información de la beca
        </span>
        <Separator />
      </div>
      <div>
        <div className=" flex justify-center ">
          <div className="w-full lg:w-3/4">
            <div className="flex flex-col gap-2 mb-4">
              <h3 className="text-xl font-semibold text-foreground">
                Información de la Beca
              </h3>
              <p className="text-muted-foreground">
                Complete todos los campos requeridos*
              </p>
            </div>
            <div>
              <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Beca*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de beca*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccione el tipo de beca" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ML">Modular</SelectItem>
                            <SelectItem value="PL">Plan de estudios</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organizationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organización*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccione la organización" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoading && (
                              <SelectItem value="#" disabled>
                                Cargando...
                              </SelectItem>
                            )}
                            {organizations && organizations?.length > 0 ? (
                              organizations?.map((org) => (
                                <SelectItem key={org.id} value={String(org.id)}>
                                  {org.name}
                                </SelectItem>
                              ))
                            ) : (
                              <Link
                                to="/education/organization"
                                className="text-sm text-muted-foreground"
                              >
                                <div className="flex flex-col items-center py-1">
                                  No hay aliados disponibles.
                                  <Separator />{' '}
                                  <span className="py-1 flex underline items-center gap-2">
                                    Crear aliado
                                    <UserPlus size={16} />
                                  </span>
                                </div>
                              </Link>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción*</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requisitos</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vacancies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vacantes Disponibles*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => {
                              const value = e.target.value
                              const number =
                                value === ''
                                  ? undefined
                                  : Number.parseInt(value, 10)
                              field.onChange(number)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de inicio*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline">
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent>
                            <Calendar
                              captionLayout="dropdown"
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={{
                                before: today,
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de fin*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline">
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent>
                            <Calendar
                              captionLayout="dropdown"
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-4 items-center">
                    <Link to="/education/scholarship">
                      <Button variant="outline" type="button">
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isPendingCreate || isPendingUpdate}
                    >
                      {isPendingCreate || isPendingUpdate ? (
                        <Loader2 className="animate-spin w-2" />
                      ) : (
                        dependantText.submit[viewType] || 'Registrar'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
const dependantText = {
  mainTitle: {
    new: 'Crear nueva beca',
    edit: 'Editar beca',
  },
  submit: {
    new: 'Registrar',
    edit: 'Guardar Cambios',
  },
}
