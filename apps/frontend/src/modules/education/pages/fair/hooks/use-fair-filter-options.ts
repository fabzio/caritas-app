import { useGetFairs } from './use-get-fair'

export const useFairFilterOptions = () => {
  const { data: response } = useGetFairs({
    currentPage: 1,
    pageSize: 1000,
    filters: {},
  })

  const allFairs = response?.data ?? []

  const uniqueRegions = Array.from(
    new Set(allFairs.map((fair) => fair.district)),
  )
    .sort()
    .map((name, index) => ({
      id: index + 1,
      name,
    }))

  const uniqueStatuses = Array.from(
    new Set(allFairs.map((fair) => fair.status)),
  ).map((status) => {
    let label = 'Finalizada'
    if (status === 'upcoming') label = 'Próxima'
    else if (status === 'ongoing') label = 'En curso'

    return {
      value: status,
      label,
    }
  })

  return {
    regions: uniqueRegions,
    statuses: uniqueStatuses,
  }
}
