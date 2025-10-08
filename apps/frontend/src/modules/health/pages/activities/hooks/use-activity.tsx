import rpc from '@frontend/lib/rpc'
import type { Filters } from '@frontend/shared/types/filters'
import { useQuery } from '@tanstack/react-query'

// Define los tipos de filtro que ya existen en tu proyecto

type UseActivitiesParams = {
  currentPage?: number
  pageSize?: number
  // Pasamos el tipo exacto que usa useFilters (que contiene page, limit, q, sortBy)
  filters?: Omit<Filters, 'page' | 'limit'> & {
    pageIndex?: number
    pageSize?: number
  }
}

export const useActivities = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseActivitiesParams) => {
  return useQuery({
    // La queryKey depende de los filtros para invalidar la caché
    queryKey: ['health-activities', filters],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.get({
        query: {
          q: filters?.q || '',
          // Lógica para transformar de 1-based (UI) a 0-based (Backend)
          page: Math.max(0, (currentPage || 1) - 1),
          limit: pageSize,
          sortBy: filters?.sortBy || 'name.asc',
        },
      })

      if (error) throw error
      return data
    },
  })
}

// ------------------------------------------
// EXPORTAMOS los tipos para que puedan ser usados en otros archivos
// ------------------------------------------
export type ActivityResponse = NonNullable<
  ReturnType<typeof useActivities>['data']
>

// AÑADIR 'export' AQUÍ
export type Activity = ActivityResponse['data'][number]
