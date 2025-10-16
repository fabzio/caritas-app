import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type GetFairsParams = {
  currentPage?: number
  pageSize?: number
  filters?: {
    q?: string
    sortBy?: string
    pageIndex?: number
    pageSize?: number
  }
}

const dummyFairs = [
  {
    id: 1,
    name: 'Feria Vocacional Universidad Nacional',
    organizationName: 'Universidad Nacional Mayor de San Marcos',
  },
  {
    id: 2,
    name: 'Feria de Carreras Técnicas',
    organizationName: 'SENATI',
  },
  {
    id: 3,
    name: 'Expo Universidades Lima',
    organizationName: 'Pontificia Universidad Católica del Perú',
  },
  {
    id: 4,
    name: 'Feria Vocacional San Juan de Lurigancho',
    organizationName: 'Cáritas Lima',
  },
  {
    id: 5,
    name: 'Feria de Orientación Vocacional PUCP',
    organizationName: 'Pontificia Universidad Católica del Perú',
  },
  {
    id: 6,
    name: 'Feria Educativa Ate Vitarte',
    organizationName: 'Universidad de Lima',
  },
  {
    id: 7,
    name: 'Expo Carreras Profesionales',
    organizationName: 'Universidad Peruana Cayetano Heredia',
  },
  {
    id: 8,
    name: 'Feria Vocacional Villa El Salvador',
    organizationName: 'Cáritas Lima',
  },
]

export const useGetFairs = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: GetFairsParams) => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.FAIR, currentPage, pageSize, filters],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800))

      let filteredFairs = [...dummyFairs]

      if (filters?.q) {
        const searchTerm = filters.q.toLowerCase()
        filteredFairs = filteredFairs.filter((fair) =>
          fair.name.toLowerCase().includes(searchTerm),
        )
      }

      const total = filteredFairs.length
      const totalPages = Math.ceil(total / pageSize)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      const paginatedData = filteredFairs.slice(start, end)

      return {
        data: paginatedData,
        total,
        totalPages,
        page: currentPage,
        limit: pageSize,
      }
    },
  })
}
