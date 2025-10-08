import { useSpecialities } from '@frontend/modules/health/pages/speciality/hooks/use-specialities'
import { useMemo } from 'react'
import { specialityTableColumns } from '../components/columns'

export const useSpecialityTable = (search: string) => {
  const { data } = useSpecialities(search)
  const columns = useMemo(() => specialityTableColumns, [])

  return {
    data,
    columns,
  }
}
