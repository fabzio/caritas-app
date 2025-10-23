import { Separator } from '@workspace/ui/components/separator'
import ScholarshipRecipientForm from './components/scholarship-recipient-form'

export default function CreateScholarshipRecipient() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          Agregar Becado
        </h1>
        <span className="text-muted-foreground">
          Busca un beneficiario y asígnalo a una beca
        </span>
        <Separator />
      </div>
      <div className="flex justify-center">
        <div className="w-full lg:w-3/4">
          <ScholarshipRecipientForm />
        </div>
      </div>
    </div>
  )
}
