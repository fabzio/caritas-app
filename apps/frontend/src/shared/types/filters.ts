import type { SortParams } from './sort-params'
export type SearchParams = { q: string }
export type PaginationParams = { pageIndex: number; pageSize: number }
export type Filters = Partial<
  SearchParams &
    PaginationParams &
    SortParams & {
      eqnumber?: number
      regionIds?: string
      startDate?: string
      endDate?: string
    }
>
