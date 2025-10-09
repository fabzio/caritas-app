import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import useGetScholarship from '../../scholarship/hooks/use-get-scholarship'
import usePostScholarshipApplication from '../../scholarship/pages/create-scholarship/hooks/use-post-scholarship-application'
import type { Beneficiary } from './use-get-beneficiaries'

const formSchema = z.object({
  beneficiaryId: z.string().min(1, 'Debe seleccionar un beneficiario'),
  scholarshipId: z.string().min(1, 'Debe seleccionar una beca'),
})

type FormSchema = z.infer<typeof formSchema>

export function useScholarshipRecipientForm() {
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null)
  const navigate = useNavigate()

  const { data: scholarshipsData, isLoading: isLoadingScholarships } =
    useGetScholarship('', 1, 20)

  const { mutateAsync: createScholarshipRecipient, isPending } =
    usePostScholarshipApplication()

  const scholarships =
    scholarshipsData?.data?.map((s: { id: number; name: string }) => ({
      id: s.id,
      name: s.name,
    })) || []

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

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!selectedBeneficiary) return

    try {
      await createScholarshipRecipient({
        scholarshipId: Number(data.scholarshipId),
        userId: selectedBeneficiary.id,
      })
    } catch (error) {
      console.error('Error creating scholarship recipient:', error)
    }
  })

  const handleCancel = () => {
    navigate({ to: '/education/recipients' })
  }

  return {
    form,
    selectedBeneficiary,
    scholarships,
    isLoadingScholarships,
    isPending,
    handleSelectBeneficiary,
    handleClearBeneficiary,
    handleSubmit,
    handleCancel,
  }
}
