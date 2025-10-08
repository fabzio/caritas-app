import rpc from '@frontend/lib/rpc' // El cliente RPC para actividades de salud
import ActivityPage from '@frontend/modules/health/pages/activities' // Tu componente principal
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod' // Se asume la importación de Zod

const ActivitySearchSchema = z.object({
  q: z.string().optional(),
  page: z.number().default(0),
  limit: z.number().default(10),
  sortBy: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/health/activities')({
  // 1. EL LOADER: Define la lógica de precarga de la primera página
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.ACTIVITIES, []],

      queryFn: async () => {
        // Llama al RPC para obtener la primera página de actividades
        const { data, error } = await rpc.health.activities.get({
          query: {
            limit: 10,
            page: 0,
            sortBy: 'name.asc',
          },
        })

        if (error) throw error

        // Devuelve los datos iniciales de la lista de actividades
        // Asegúrate de que el formato coincida con el tipo esperado por tu API (data, total, etc.)
        return data || { data: [], total: 0, page: 0, totalPages: 1, limit: 10 }
      },
    }),

  validateSearch: ActivitySearchSchema,

  // 3. El componente a renderizar
  component: ActivityPage,
})
