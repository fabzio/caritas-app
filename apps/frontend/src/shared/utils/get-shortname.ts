const getShortname = (params: { firstName: string; lastName: string }) => {
  return `${params.firstName.charAt(0)}${params.lastName.charAt(0)}`.toUpperCase()
}

export default getShortname
