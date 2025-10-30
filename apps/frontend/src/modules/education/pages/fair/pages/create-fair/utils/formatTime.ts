const formatTime = (timeString: string) => {
  const [timeWithoutTimezone] = timeString.split('+')
  const [hours, minutes, seconds] = timeWithoutTimezone.split(':')
  return `${hours}:${minutes}:${seconds || '00'}`
}

export default formatTime
