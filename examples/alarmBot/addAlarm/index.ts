interface Alarm {
  alarmName: string,
  alarmTime: string
}

export const props = {
  name: 'alarms'
}

export const submit = (prev: Alarm[] = [], alarm: Alarm) => {
  const alarms = [
    ...prev,
    alarm
  ]

  return alarms
}

export const acknowledge = ({getSubmittedData}) => {
  const value = getSubmittedData()
  return `Your ${value.alarmName} alarm is added!`
}
