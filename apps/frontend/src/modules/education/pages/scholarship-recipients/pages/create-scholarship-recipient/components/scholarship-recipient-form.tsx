import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Separator } from '@workspace/ui/components/separator'
import { GraduationCap, UserPlus } from 'lucide-react'
import { useScholarshipRecipientForm } from '../hooks/use-scholarship-recipient-form'
import BeneficiarySearch from './beneficiary-search'

export default function ScholarshipRecipientForm() {
  const {
    form,
    selectedBeneficiary,
    scholarships,
    isLoadingScholarships,
    isPending,
    handleSelectBeneficiary,
    handleClearBeneficiary,
    handleSubmit,
    handleCancel,
  } = useScholarshipRecipientForm()

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-lg font-medium">Buscar Beneficiario</h3>
          <p className="text-sm text-muted-foreground">
            Busca por nombre o número de documento
          </p>
        </div>

        <FormField
          control={form.control}
          name="beneficiaryId"
          render={() => (
            <FormItem className="flex flex-col">
              <BeneficiarySearch
                selectedBeneficiary={selectedBeneficiary}
                onSelect={handleSelectBeneficiary}
                onClear={handleClearBeneficiary}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Seleccionar Beca</h3>
            <p className="text-sm text-muted-foreground">
              Elige la beca a la que deseas agregar al estudiante
            </p>
          </div>

          <FormField
            control={form.control}
            name="scholarshipId"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingScholarships}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingScholarships
                            ? 'Cargando becas...'
                            : 'Seleccione la beca'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {scholarships.length > 0 ? (
                      scholarships.map(
                        (scholarship: { id: number; name: string }) => (
                          <SelectItem
                            key={scholarship.id}
                            value={String(scholarship.id)}
                          >
                            {scholarship.name}
                          </SelectItem>
                        ),
                      )
                    ) : (
                      <Link
                        to="/education/scholarship/form"
                        search={{
                          type: 'new',
                        }}
                        className="text-sm text-muted-foreground"
                      >
                        <div className="flex flex-col items-center py-1">
                          No hay becas disponibles.
                          <Separator />{' '}
                          <span className="py-1 flex underline items-center gap-2">
                            Agregar nueva beca
                            <GraduationCap size={16} />
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
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!selectedBeneficiary || isPending}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {isPending ? 'Agregando...' : 'Agregar Becado'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
