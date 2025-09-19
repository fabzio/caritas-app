import { type QueryKey, useQueryClient } from '@tanstack/react-query'

export const useQueryStore = <T>(queryKey: QueryKey) => {
  const queryClient = useQueryClient()
  const queryData = queryClient.getQueryData<T[]>(queryKey) ?? []

  const setQueryData = (callback: (curr: T[]) => T[]) => {
    return callback(queryData)
  }
  const cancelQuery = async () => {
    await queryClient.cancelQueries({ queryKey })
  }
  const invalidateQuery = async () => {
    await queryClient.invalidateQueries({ queryKey })
  }
  return {
    data: queryData,
    setData: setQueryData,
    cancelQuery,
    invalidateQuery,
  }
}
