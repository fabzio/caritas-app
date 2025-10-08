import { useSpecialities } from '@frontend/modules/health/pages/speciality/hooks/use-specialities'
import { useMemo } from 'react'
import { specialityTableColumns } from '../components/columns'

export const useSpecialityTable = () => {
  const { data } = useSpecialities()
  const columns = useMemo(() => specialityTableColumns, [])

  return {
    data,
    columns,
  }
}
