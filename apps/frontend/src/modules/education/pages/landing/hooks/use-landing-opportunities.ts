import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

type FairsResponse = Awaited<ReturnType<typeof rpc.education.fairs.get>>['data']

type ScholarshipsResponse = Awaited<
  ReturnType<typeof rpc.education.scholarship.get>
>['data']

export type LandingFair = {
  id: number
  title: string
  address: string
  district: string
  startTime: string
  endTime: string
  status: 'upcoming' | 'ongoing' | 'finished'
  date: Date
}

export type LandingScholarship = {
  id: number
  name: string
  description: string
  organizationName?: string
  startDate: string
  endDate: string
  vacancies: number
  daysLeft?: number
}

const UPCOMING_STATUS = 'upcoming,ongoing'
const MAX_ITEMS = 8

const normalizeFairDate = (value: Date | string) => {
  const parsed =
    value instanceof Date
      ? value
      : new Date(typeof value === 'string' ? value : '')
  if (Number.isNaN(parsed.getTime())) return new Date()
  return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000)
}

export const useLandingOpportunities = () => {
  const {
    data: fairsResponse,
    isLoading: fairsLoading,
    isError: fairsError,
    error: fairsErrorMessage,
  } = useQuery<FairsResponse>({
    queryKey: [QueryKeys.EDUCATION.FAIR, 'landing', UPCOMING_STATUS],
    queryFn: async () => {
      const response = await rpc.education.fairs.get({
        query: {
          page: 0,
          limit: MAX_ITEMS,
          status: UPCOMING_STATUS,
          sortBy: 'date.asc',
        },
      })

      if (response.error) {
        throw new Error(
          typeof response.error.value === 'string'
            ? response.error.value
            : 'No se pudo cargar las ferias.',
        )
      }

      return response.data
    },
    staleTime: 1000 * 60,
  })

  const {
    data: scholarshipsResponse,
    isLoading: scholarshipsLoading,
    isError: scholarshipsError,
    error: scholarshipsErrorMessage,
  } = useQuery<ScholarshipsResponse>({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP, 'landing', 'active'],
    queryFn: async () => {
      const response = await rpc.education.scholarship.get({
        query: {
          active: true,
          page: 1,
          pageSize: MAX_ITEMS * 2,
        },
      })

      if (response.error) throw response.error

      return response.data
    },
    staleTime: 1000 * 60,
  })

  const fairs: LandingFair[] = useMemo(() => {
    if (!fairsResponse?.data) return []
    return fairsResponse.data.map((fair) => ({
      id: fair.id,
      title: fair.title,
      address: fair.address,
      district: fair.district,
      startTime: fair.startTime,
      endTime: fair.endTime,
      status: fair.status,
      date: normalizeFairDate(fair.date),
    }))
  }, [fairsResponse?.data])

  const scholarships: LandingScholarship[] = useMemo(() => {
    if (!scholarshipsResponse?.data) return []
    const now = new Date()
    const filtered = scholarshipsResponse.data.filter((scholarship) => {
      const end = new Date(scholarship.endDate)
      if (Number.isNaN(end.getTime())) return true
      return end.getTime() >= now.getTime()
    })

    return filtered
      .sort((a, b) => {
        const aStart = new Date(a.startDate).getTime()
        const bStart = new Date(b.startDate).getTime()
        return aStart - bStart
      })
      .slice(0, MAX_ITEMS)
      .map((scholarship) => {
        const end = new Date(scholarship.endDate)
        const daysLeft = Number.isNaN(end.getTime())
          ? undefined
          : Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000))

        return {
          id: scholarship.id,
          name: scholarship.name,
          description: scholarship.description,
          organizationName: scholarship.organization?.name ?? undefined,
          startDate: scholarship.startDate,
          endDate: scholarship.endDate,
          vacancies: scholarship.vacancies ?? 0,
          daysLeft,
        }
      })
  }, [scholarshipsResponse?.data])

  return {
    fairs: {
      items: fairs,
      isLoading: fairsLoading,
      isError: fairsError,
      error: fairsErrorMessage instanceof Error ? fairsErrorMessage : null,
    },
    scholarships: {
      items: scholarships,
      isLoading: scholarshipsLoading,
      isError: scholarshipsError,
      error:
        scholarshipsErrorMessage instanceof Error
          ? scholarshipsErrorMessage
          : null,
    },
  }
}
