export const props = {
  name: 'alarms'
}

export const submit = (prev) => {
  return prev
}

export const acknowledge = ({ getSgState }): string => {
  const alarms = getSgState() || []
  if (alarms.length === 0) {
    return `You do not have any alarms!`
  }
  return alarms.map(alarms => alarms.alarmName + ' at ' + alarms.alarmTime).join(', ')
}