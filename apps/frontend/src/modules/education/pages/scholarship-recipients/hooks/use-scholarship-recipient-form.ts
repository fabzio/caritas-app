import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { Beneficiary } from './use-beneficiary-search'

const DUMMY_SCHOLARSHIPS = [
  { id: 1, name: 'Beca de Investigación' },
  { id: 2, name: 'Beca de Excelencia Académica' },
  { id: 3, name: 'Beca de Apoyo Social' },
]

const formSchema = z.object({
  beneficiaryId: z.string().min(1, 'Debe seleccionar un beneficiario'),
  scholarshipId: z.string().min(1, 'Debe seleccionar una beca'),
})

type FormSchema = z.infer<typeof formSchema>

export function useScholarshipRecipientForm() {
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null)
  const navigate = useNavigate()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaryId: '',
      scholarshipId: '',
    },
  })

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    form.setValue('beneficiaryId', beneficiary.id)
  }

  const handleClearBeneficiary = () => {
    setSelectedBeneficiary(null)
    form.setValue('beneficiaryId', '')
  }

  const handleSubmit = form.handleSubmit((data) => {
    if (!selectedBeneficiary) return

    const selectedScholarship = DUMMY_SCHOLARSHIPS.find(
      (s) => s.id === Number(data.scholarshipId),
    )

    toast.success(
      `Beneficiario "${selectedBeneficiary.name}" agregado a "${selectedScholarship?.name}"`,
    )

    setTimeout(() => {
      navigate({ to: '/education/scholarship' })
    }, 1000)
  })

  const handleCancel = () => {
    navigate({ to: '/education/scholarship' })
  }

  return {
    form,
    selectedBeneficiary,
    scholarships: DUMMY_SCHOLARSHIPS,
    handleSelectBeneficiary,
    handleClearBeneficiary,
    handleSubmit,
    handleCancel,
  }
}
