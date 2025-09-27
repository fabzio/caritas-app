import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@workspace/ui/components/form'
import { useForm } from 'react-hook-form'
import { useCreateOrganization } from '../../hooks/use-create-organization'
import { OrgStepper, useOrgStepper } from '../provider'
import StepperControls from '../stepper-controls'
import OrganizationNameForm from './organization-name'
import OrganizationTypeForm from './organization-type'

export default function WelcomeOrgStepper() {
  const methods = useOrgStepper()
  const { mutate } = useCreateOrganization()
  const form = useForm({
    resolver: zodResolver(methods.current.schema),
    defaultValues: {
      name: '',
      type: undefined,
    },
  })
  const handleSubmit = form.handleSubmit(() => {
    if (!methods.isLast) {
      methods.next()
    } else {
      const full = form.getValues() as {
        name: string
        type: string
      }
      mutate(full)
      methods.reset()
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        {methods.switch({
          'step-1': () => <OrganizationTypeForm />,
          'step-2': () => <OrganizationNameForm />,
        })}
        <OrgStepper.Controls className="mt-4">
          <StepperControls
            isFirst={methods.isFirst}
            isLast={methods.isLast}
            onPrev={methods.prev}
            onNext={methods.next}
          />
        </OrgStepper.Controls>
      </form>
    </Form>
  )
}
