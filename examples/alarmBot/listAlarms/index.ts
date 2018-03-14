export const props = {
  name: 'alarms'
}

export const submit = (prev = []) => {
  return prev
}

export const acknowledge = ({getSgState}) => {
  const alarms = getSgState()
  return alarms.map(alarms => alarms.alarmName + ' at ' + alarms.alarmTime).join(', ')
}