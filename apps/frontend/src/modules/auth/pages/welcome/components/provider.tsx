import { defineStepper } from '@workspace/ui/components/stepper'
import type { PropsWithChildren } from 'react'
import z from 'zod'
import {
  organizationFormSchema,
  organizationTypeFormSchema,
} from '../models/organization'
import {
  patientFormSchema,
  personFormSchema,
  studentFormSchema,
} from '../models/person'

export const { Stepper: OrgStepper, useStepper: useOrgStepper } = defineStepper(
  {
    id: 'step-1',
    title: 'Step 1',
    schema: organizationTypeFormSchema,
  },
  {
    id: 'step-2',
    title: 'Step 2',
    schema: organizationFormSchema,
  },
)
export const { Stepper: UserStepper, useStepper: useUserStepper } =
  defineStepper(
    {
      id: 'step-1',
      title: 'Step 1',
    },
    { id: 'step-2', title: 'Step 2' },
  )
export const { Stepper: PersonStepper, useStepper: usePersonStepper } =
  defineStepper(
    {
      id: 'step-1',
      title: 'Step 1',
      schema: personFormSchema,
    },
    {
      id: 'step-2',
      title: 'Step 2',
      schema: z.union([studentFormSchema, patientFormSchema]),
    },
  )

export function OrgProvider({ children }: Readonly<PropsWithChildren>) {
  return <OrgStepper.Provider>{children}</OrgStepper.Provider>
}

export function UserProvider({ children }: Readonly<PropsWithChildren>) {
  return <UserStepper.Provider>{children}</UserStepper.Provider>
}

export function PersonProvider({ children }: Readonly<PropsWithChildren>) {
  return <PersonStepper.Provider>{children}</PersonStepper.Provider>
}
