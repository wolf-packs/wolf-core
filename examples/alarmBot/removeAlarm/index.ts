interface Alarm {
  alarmName: string,
  alarmTime: string
}

export const props = {
  name: 'alarms'
}

export const submit = (prev: any = [], value) => {
  return prev.filter(alarm => alarm.alarmName !== value.alarmName)
}

export const acknowledge = ({ getSubmittedData }): string => {
  const value = getSubmittedData()
  return `Your ${value.alarmName} alarm is removed!`
}
