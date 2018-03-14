export default [
  {
    entity: 'alarmName',
    type: 'string',
    query: 'What is the name of the alarm?',
    acknowledge: (value) => `ok! name is set to ${value}.`
  },
  {
    entity: 'alarmTime',
    type: 'string',
    query: 'What is the time you want to set?',
    acknowledge: (value) => `ok! time is set to ${value}.`
  }
]