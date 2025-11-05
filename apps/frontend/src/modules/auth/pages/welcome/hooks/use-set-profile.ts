import { useSession } from '@frontend/hooks/use-session'
import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type {
  PatientForm,
  PersonForm,
  StudentForm,
} from '../../../../../shared/models/person'

type ProfileMutationPayload = PersonForm &
  Partial<StudentForm> &
  Partial<PatientForm> & {
    schoolId?: string
  }

type StudentInfoPayload = {
  grade: string
  guardianEmail: string
}

type PatientInfoPayload = {
  insuranceType: PatientForm['insuranceType']
}

const buildStudentInfo = (
  params: ProfileMutationPayload,
  userEmail: string,
): StudentInfoPayload | undefined => {
  if (!params.profiles.includes('student')) return undefined
  const { grade, guardianEmail } = params
  if (!grade || !guardianEmail) {
    throw new Error('Student profile requires grade and guardian email')
  }
  if (guardianEmail === userEmail) {
    throw new Error(
      'El correo del apoderado no puede ser el mismo que el del estudiante',
    )
  }
  return {
    grade,
    guardianEmail,
  }
}

const buildPatientInfo = (
  params: ProfileMutationPayload,
): PatientInfoPayload | undefined => {
  if (!params.profiles.includes('patient')) return undefined
  const { insuranceType } = params
  if (!insuranceType) {
    throw new Error('Patient profile requires insurance type')
  }
  return {
    insuranceType,
  }
}

const persistStudentInfo = async (
  userId: string,
  info?: StudentInfoPayload,
) => {
  if (!info) return
  const { error } = await rpc.auth.info.student.post({
    userId,
    grade: info.grade,
    guardianEmail: info.guardianEmail,
  })
  if (error) throw error
}

const persistPatientInfo = async (
  userId: string,
  info?: PatientInfoPayload,
) => {
  if (!info) return
  const { error } = await rpc.auth.info.patient.post({
    userId,
    insuranceType: info.insuranceType,
  })
  if (error) throw error
}

export const useSetProfile = () => {
  const { data: userData, error: sessionError } = useSession()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (params: ProfileMutationPayload) => {
      if (sessionError) throw sessionError
      if (!userData) throw new Error('No user data')
      const studentInfo = buildStudentInfo(params, userData.user.email)
      const patientInfo = buildPatientInfo(params)
      await persistStudentInfo(userData.user.id, studentInfo)
      await persistPatientInfo(userData.user.id, patientInfo)
    },
    onSuccess: () => {
      navigate({ to: '/user' })
    },
  })
}
