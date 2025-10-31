import { useSession } from '@frontend/hooks/use-session'
import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { PatientForm, PersonForm, StudentForm } from '../models/person'

type ProfileMutationPayload = PersonForm &
  Partial<StudentForm> &
  Partial<PatientForm> & {
    schoolId?: string
  }

export const useSetProfile = () => {
  const { data: userData, error: sessionError } = useSession()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (params: ProfileMutationPayload) => {
      if (sessionError) throw sessionError
      if (!userData) throw new Error('No user data')
      const hasStudentProfile = params.profiles.includes('student')
      const hasPatientProfile = params.profiles.includes('patient')

      let studentInfo:
        | {
            grade: string
            guardianEmail: string
          }
        | undefined

      if (hasStudentProfile) {
        const { grade, guardianEmail } = params
        if (!grade || !guardianEmail) {
          throw new Error('Student profile requires grade and guardian email')
        }
        if (userData.user.email === guardianEmail) {
          throw new Error(
            'El correo del apoderado no puede ser el mismo que el del estudiante',
          )
        }
        studentInfo = {
          grade,
          guardianEmail,
        }
      }

      let patientInfo:
        | {
            insuranceType: PatientForm['insuranceType']
          }
        | undefined

      if (hasPatientProfile) {
        const { insuranceType } = params
        if (!insuranceType) {
          throw new Error('Patient profile requires insurance type')
        }
        patientInfo = {
          insuranceType,
        }
      }
      const { error } = await rpc.auth.welcome.user.post({
        userId: userData.user.id,
        patientInfo,
        studentInfo,
      })
      if (error) throw error
    },
    onSuccess: () => {
      navigate({ to: '/user' })
    },
  })
}
