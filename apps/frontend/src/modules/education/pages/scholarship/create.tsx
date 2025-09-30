import { zodResolver } from '@hookform/resolvers/zod'
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
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
      type: undefined,
    },
  })
  const today = new Date()

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
        <div className=" flex justify-center ">
          <Card className="w-full lg:w-3/4">
            <CardHeader>
              <CardTitle>Información de la Beca</CardTitle>
              <CardDescription>
                Complete todos los campos requeridos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Beca</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de beca</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione la organización" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="modular">Modular</SelectItem>
                            <SelectItem value="studiesPlan">
                              Plan de estudios
                            </SelectItem>
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
                        <FormLabel>Organización</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de beca" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ORG1">Organización 1</SelectItem>
                            <SelectItem value="ORG2">Organización 2</SelectItem>
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
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vacanties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vacantes Disponibles</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startOfDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Inicio </FormLabel>
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
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={{
                                before: today,
                                after: form.getValues('endOfDate'),
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endOfDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de fin</FormLabel>
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
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={{ before: today }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <CardFooter className="flex justify-end gap-4 ">
                    <Button variant="outline">Cancelar</Button>
                    <Button variant="default">Registrar</Button>
                  </CardFooter>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
