// apps/api/src/modules/health/activity/model.ts

import { activity } from '@api/db/schemas/health'
import { createInsertSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace ActivityModel {
  // Esquemas de la tabla (generados automáticamente)
  const _createActivity = createInsertSchema(activity)

  // 1. ESQUEMA DE LECTURA (Una fila)
  export const listActivitySchema = t.Object({
    id: t.Integer(),
    name: t.String(),
    date: t.Date(),
    duration: t.String(), // Los intervalos suelen mapearse a string
    state: t.Boolean(),
    // Nuevos campos de los JOINS
    statusName: t.String(),
    typeName: t.String(),
    spaceName: t.String(),
    creatorName: t.String(),
    // ... añade cualquier otro campo que seleccionaste en el service.ts
  })

  // 2. ESQUEMA DE PÁGINAS Y CONSULTA (QUERY)
  export const listActivitiesQuery = t.Object({
    q: t.Optional(t.String()), // Cadena de búsqueda
    page: t.Optional(t.Integer({ minimum: 0 })), // Número de página (base 0)
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })), // Límite por página
    sortBy: t.Optional(t.String()), // Campo y dirección de ordenamiento (ej: name.asc)
  })
  export type ListActivitiesQuery = typeof listActivitiesQuery.static

  // 3. ESQUEMA DE RESPUESTA COMPLETA (con metadata)
  export const getActivitiesResponse = t.Object({
    data: t.Array(listActivitySchema), // Array de actividades
    total: t.Integer(), // Conteo total de filas
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetActivities = typeof getActivitiesResponse.static // Nuevo tipo de retorno

  // 4. ESQUEMA DE CREACIÓN
  export const createActivity = t.Object({
    name: t.String({ minLength: 1, maxLength: 100 }),
    date: t.Date(),
    duration: t.String(), // interval se envía como string, ejemplo: '2 hours'
    spaceId: t.String({ minLength: 32, maxLength: 32 }), // UUID/ref a organization
    statusId: t.Integer({ minimum: 1, maximum: 6 }), // 1-6 según activity_status
    typeId: t.Integer({ minimum: 1, maximum: 2 }), // 1-2 según activity_type
    userId: t.String({ minLength: 32, maxLength: 32 }), // UUID del creador
  })
  export type CreateActivity = typeof createActivity.static

  // 5. ESQUEMA DE ELIMINACIÓN (Lógica)
  export const deleteActivities = t.Object({
    ids: t.Array(t.Integer({ minimum: 1 }), { minItems: 1 }), // Array de IDs a eliminar
  })
  export type DeleteActivities = typeof deleteActivities.static

  // 6. ESQUEMA DE CREACIÓN COMPLETA (Actividad + Participantes)
  export const createCompleteActivity = t.Object({
    // Datos de la actividad
    name: t.String({ minLength: 1, maxLength: 100 }),
    date: t.Date(),
    duration: t.String(),
    description: t.Optional(t.String({ maxLength: 500 })),
    spaceId: t.String({ minLength: 32, maxLength: 32 }),
    statusId: t.Integer({ minimum: 1, maximum: 6 }),
    typeId: t.Integer({ minimum: 1, maximum: 2 }),
    userId: t.String({ minLength: 32, maxLength: 32 }),
    // Participantes (aliados con especialidades)
    participants: t.Array(
      t.Object({
        alliedId: t.String({ minLength: 32, maxLength: 32 }), // ID del aliado (organization)
        specialityIds: t.Array(t.Integer({ minimum: 1 }), { minItems: 1 }), // IDs de especialidades
      }),
      { minItems: 1 },
    ),
  })
  export type CreateCompleteActivity = typeof createCompleteActivity.static
}
