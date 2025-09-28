import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@workspace/ui/components/form'
import { useForm } from 'react-hook-form'
import { useSetProfile } from '../../hooks/use-set-profile'
import { PersonStepper, usePersonStepper } from '../provider'
import StepperControls from '../stepper-controls'
import PersonProfileForm from './person-profile'
import ProfileDetailsForm from './profile-details'

export default function WelcomePersonStepper() {
  const methods = usePersonStepper()
  const { mutate } = useSetProfile()
  const form = useForm({
    resolver: zodResolver(methods.current.schema),
    defaultValues: {
      profiles: [],
      grade: undefined,
    },
  })
  const handleSubmit = form.handleSubmit(() => {
    if (!methods.isLast) {
      methods.next()
    } else {
      const full = form.getValues() as {
        profiles: ('student' | 'patient')[]
        schoolId?: string
        grade?: string
        guardianEmail?: string
        insuranceType?: 'none' | 'public' | 'private'
      }
      mutate({
        profiles: full.profiles,
        schoolId: full.schoolId,
        grade: full.grade,
        guardianEmail: full.guardianEmail,
        insuranceType: full.insuranceType,
      })
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        {methods.switch({
          'step-1': () => <PersonProfileForm />,
          'step-2': () => <ProfileDetailsForm />,
        })}
        <PersonStepper.Controls className="mt-4">
          <StepperControls
            isFirst={methods.isFirst}
            isLast={methods.isLast}
            onPrev={methods.prev}
            onNext={methods.next}
          />
        </PersonStepper.Controls>
      </form>
    </Form>
  )
}
