import db from '@api/db'
import { organization, region } from './schemas/auth'

const districts = [
  { name: 'Lima', code: 'Lima 01' },
  { name: 'Ancon', code: 'Lima 02' },
  { name: 'Ate', code: 'Lima 03' },
  { name: 'Barranco', code: 'Lima 04' },
  { name: 'Breña', code: 'Lima 05' },
  { name: 'Carabayllo', code: 'Lima 06' },
  { name: 'Chaclacayo', code: 'Lima 08' },
  { name: 'Chorrillos', code: 'Lima 09' },
  { name: 'Cieneguilla', code: 'Lima 40' },
  { name: 'Comas', code: 'Lima 07' },
  { name: 'El Agustino', code: 'Lima 10' },
  { name: 'Independencia', code: 'Lima 28' },
  { name: 'Jesus Maria', code: 'Lima 11' },
  { name: 'La Molina', code: 'Lima 12' },
  { name: 'La Victoria', code: 'Lima 13' },
  { name: 'Lince', code: 'Lima 14' },
  { name: 'Los Olivos', code: 'Lima 39' },
  { name: 'Lurigancho', code: 'Lima 15' },
  { name: 'Lurin', code: 'Lima 16' },
  { name: 'Magdalena Del Mar', code: 'Lima 17' },
  { name: 'Miraflores', code: 'Lima 18' },
  { name: 'Pachacamac', code: 'Lima 19' },
  { name: 'Pucusana', code: 'Lima 20' },
  { name: 'Pueblo Libre', code: 'Lima 21' },
  { name: 'Puente Piedra', code: 'Lima 22' },
  { name: 'Punta Hermosa', code: 'Lima 24' },
  { name: 'Punta Negra', code: 'Lima 23' },
  { name: 'Rimac', code: 'Lima 25' },
  { name: 'San Bartolo', code: 'Lima 26' },
  { name: 'San Borja', code: 'Lima 41' },
  { name: 'San Isidro', code: 'Lima 27' },
  { name: 'San Juan De Lurigancho', code: 'Lima 36' },
  { name: 'San Juan De Miraflores', code: 'Lima 29' },
  { name: 'San Luis', code: 'Lima 30' },
  { name: 'San Martin De Porres', code: 'Lima 31' },
  { name: 'San Miguel', code: 'Lima 32' },
  { name: 'Santa Anita', code: 'Lima 43' },
  { name: 'Santa Maria Del Mar', code: 'Lima 37' },
  { name: 'Santa Rosa', code: 'Lima 38' },
  { name: 'Santiago De Surco', code: 'Lima 33' },
  { name: 'Surquillo', code: 'Lima 34' },
  { name: 'Villa El Salvador', code: 'Lima 42' },
  { name: 'Villa Maria Del Triunfo', code: 'Lima 35' },
] as const

const healthorgs = [
  {
    id: 'uYtX2JKlP9mbQ3A6ZnE7fYwTsHcD0eRj',
    name: 'Hospital Nacional Dos de Mayo',
    active: true,
    slug: 'hospital-nacional-dos-de-mayo',
    logo: null,
    createdAt: '2025-10-01T23:42:10.100Z',
    updatedAt: '2025-10-01T23:42:10.100Z',
    metadata: null,
    type: 'health',
  },
  {
    id: 'mQ9pThKc8wZjU2oEr1DyXvHsFbG7LaN5',
    name: 'Clínica Anglo Americana',
    active: true,
    slug: 'clinica-anglo-americana',
    logo: null,
    createdAt: '2025-10-01T23:42:15.200Z',
    updatedAt: '2025-10-01T23:42:15.200Z',
    metadata: null,
    type: 'health',
  },
  {
    id: 'zV3rWkYpQ2nB5cF0Xj7tUhLaM1sDgE9H',
    name: 'Centro de Salud San Juan de Lurigancho',
    active: true,
    slug: 'centro-de-salud-san-juan-de-lurigancho',
    logo: null,
    createdAt: '2025-10-01T23:42:20.300Z',
    updatedAt: '2025-10-01T23:42:20.300Z',
    metadata: null,
    type: 'health',
  },
  {
    id: 'aL6fRjV0uN2xPwT5yC8hSmGkQ1eB9dXz',
    name: 'Hospital Edgardo Rebagliati Martins',
    active: true,
    slug: 'hospital-edgardo-rebagliati-martins',
    logo: null,
    createdAt: '2025-10-01T23:42:25.400Z',
    updatedAt: '2025-10-01T23:42:25.400Z',
    metadata: null,
    type: 'health',
  },
  {
    id: 'pK7dSgX2hT1rFzV9oM3wNcA4yL5eQbJ0',
    name: 'Clínica Internacional',
    active: true,
    slug: 'clinica-internacional',
    logo: null,
    createdAt: '2025-10-01T23:42:30.500Z',
    updatedAt: '2025-10-01T23:42:30.500Z',
    metadata: null,
    type: 'health',
  },
] as const

export const seed = async () => {
  await db.insert(region).values(
    districts.map((district) => ({
      name: district.name,
      type: 'district' as const,
      code: district.code,
    })),
  )
  await db.insert(organization).values(
    healthorgs.map((org) => ({
      id: org.id,
      name: org.name,
      active: org.active ?? true,
      slug: org.slug,
      logo: org.logo ?? null,
      createdAt: new Date(org.createdAt),
      updatedAt: new Date(org.updatedAt),
      metadata: org.metadata ?? null,
      type: 'health' as const,
    })),
  )
  console.info(`🌱 Seeded ${healthorgs.length} healthorgs`)

  console.info(`🌱 Seeded ${districts.length} districts`)
}

if (import.meta.main) {
  seed().catch(console.error)
}
