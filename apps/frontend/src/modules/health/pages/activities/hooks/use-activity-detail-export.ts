import rpc from '@frontend/lib/rpc'
import { z } from 'zod'

const ExportQuerySchema = z.object({
  activityIds: z.string().optional(),
  filterOnly: z.string().optional(),
  q: z.string().optional(),
  regionIds: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type ExportQuery = z.infer<typeof ExportQuerySchema>

/**
 * Llama al endpoint de exportación CSV y fuerza la descarga del archivo Blob.
 * @param query Los parámetros de filtrado o la lista de IDs de actividad.
 */
export const exportActivitiesDetailCsv = async (query: ExportQuery) => {
  try {
    const { data, error } = await rpc.health.activities.export.get({ query })

    if (error) {
      throw new Error(error.value as string)
    }

    const csvContent = data

    const blob = new Blob([csvContent], { type: 'text/csv' })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    const filename = `detalle_actividades_${new Date().toISOString().slice(0, 10)}.csv`

    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    a.remove()
  } catch (e) {
    console.error('Error al exportar actividades:', e)
    throw e
  }
}
