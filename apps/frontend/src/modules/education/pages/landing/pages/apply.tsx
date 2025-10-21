import FullColorCaritasLogo from '@frontend/assets/img/landing/logo-fullcolor.png'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLoaderData, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
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
import { Spinner } from '@workspace/ui/components/spinner'
import { cn } from '@workspace/ui/lib/utils'
import { Check, ChevronsUpDown, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const applyFormSchema = z.object({
  scholarshipId: z.number({
    error: 'Debes seleccionar una beca',
  }),
})

export default function ApplyPage() {
  const { isLoggedIn, user, scholarships } = useLoaderData({
    from: '/landing/apply',
  })
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof applyFormSchema>>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      scholarshipId: undefined,
    },
  })

  const onSubmit = async (values: z.infer<typeof applyFormSchema>) => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('¡Postulación enviada exitosamente!')
      navigate({ to: '/landing' })
    } catch (error) {
      toast.error('Error al enviar la postulación')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = form.handleSubmit(onSubmit)

  const handleLoginRedirect = () => {
    navigate({ to: '/auth/login', search: { redirect: '/landing/apply' } })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img
                src={FullColorCaritasLogo}
                alt="Cáritas lima"
                className="h-12"
              />
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Postular a una Beca
          </h1>

          {!isLoggedIn ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Inicia sesión para continuar
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Para postular a una beca es necesario haber iniciado sesión en
                Cáritas365. Inicia sesión o crea una cuenta para continuar con
                tu postulación.
              </p>
              <Button
                onClick={handleLoginRedirect}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
              >
                <LogIn className="mr-2" />
                Iniciar Sesión
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-8">
                Completa el formulario para postular a una beca. Verifica que
                tus datos sean correctos antes de continuar.
              </p>

              <Form {...form}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Tus Datos
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormItem>
                        <FormLabel className="text-gray-700">Nombre</FormLabel>
                        <FormControl>
                          <Input
                            value={user?.name || ''}
                            disabled
                            className="disabled:bg-white disabled:text-gray-900 disabled:opacity-100"
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Apellido
                        </FormLabel>
                        <FormControl>
                          <Input
                            value={user?.surname || ''}
                            disabled
                            className="disabled:bg-white disabled:text-gray-900 disabled:opacity-100"
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Correo Electrónico
                        </FormLabel>
                        <FormControl>
                          <Input
                            value={user?.email || ''}
                            disabled
                            className="disabled:bg-white disabled:text-gray-900 disabled:opacity-100"
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Teléfono
                        </FormLabel>
                        <FormControl>
                          <Input
                            value={user?.phone || ''}
                            disabled
                            className="disabled:bg-white disabled:text-gray-900 disabled:opacity-100"
                          />
                        </FormControl>
                      </FormItem>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Tipo de Documento
                        </FormLabel>
                        <FormControl>
                          <Input
                            value={user?.documentType || ''}
                            disabled
                            className="disabled:bg-white disabled:text-gray-900 disabled:opacity-100"
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Número de Documento
                        </FormLabel>
                        <FormControl>
                          <Input
                            value={user?.documentNumber || ''}
                            disabled
                            className="disabled:bg-white disabled:text-gray-900 disabled:opacity-100"
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="scholarshipId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base">
                          Selecciona una Beca
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value
                                  ? scholarships.find(
                                      (s) => s.id === field.value,
                                    )?.name
                                  : 'Buscar una beca...'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput
                                placeholder="Buscar beca..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron becas.
                                </CommandEmpty>
                                <CommandGroup>
                                  {scholarships.map((scholarship) => (
                                    <CommandItem
                                      key={scholarship.id}
                                      value={scholarship.name}
                                      onSelect={() => {
                                        form.setValue(
                                          'scholarshipId',
                                          scholarship.id,
                                        )
                                      }}
                                    >
                                      {scholarship.name}
                                      <Check
                                        className={cn(
                                          'ml-auto h-4 w-4',
                                          scholarship.id === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                    >
                      {isSubmitting ? <Spinner /> : 'Postular'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-gray-700"
                      onClick={() => navigate({ to: '/landing' })}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
