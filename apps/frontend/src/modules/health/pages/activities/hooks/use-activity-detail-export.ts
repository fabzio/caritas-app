import rpc from '@frontend/lib/rpc' // Tu cliente RPC
import { z } from 'zod' // Si usas Zod para tipado de queries

// 🛠️ NOTA: Define un esquema simple para los parámetros de la exportación,
// similar a como lo haces en tu ActivitySearchSchema.
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
    // 1. Llamada al endpoint RPC
    // Debes asegurarte que 'exportCsv' está expuesto en tu cliente RPC
    const { data, error } = await rpc.health.activities.export.get({ query })

    if (error) {
      // Manejo de errores 400 del backend (ej: "No hay actividades para exportar")
      throw new Error(error.value as string)
    }

    // 2. Manejo de la Descarga del Blob
    // El backend responde con una cadena CSV (que el cliente RPC maneja como texto o ArrayBuffer)
    const csvContent = data

    // Crear un Blob con el tipo MIME correcto
    const blob = new Blob([csvContent], { type: 'text/csv' })

    // 3. Crear URL temporal y disparar la descarga
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    // El nombre de archivo lo definimos aquí si el RPC no permite leer Content-Disposition
    const filename = `detalle_actividades_${new Date().toISOString().slice(0, 10)}.csv`

    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    // 4. Limpieza
    window.URL.revokeObjectURL(url)
    a.remove()
  } catch (e) {
    console.error('Error al exportar actividades:', e)
    // Podrías lanzar el error nuevamente para que sea manejado por un hook/componente
    throw e
  }
}
