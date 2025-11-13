export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const adjustedDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60000,
  )
  return adjustedDate.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString)
  const adjustedDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60000,
  )
  const day = adjustedDate.getDate().toString().padStart(2, '0')
  const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0')
  const year = adjustedDate.getFullYear()
  return `${day}/${month}/${year}`
}

export const parseDateFromDDMMYYYY = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number)
  return new Date(year, month - 1, day)
}
