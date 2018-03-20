export default [
  {
    name: 'addAlarm',
    slots: [
      {
        entity: 'alarmName',
        type: 'string',
        query: 'What is the name of the alarm?',
        retryQuery: (turnCount) => {
          const phrase = ['retry1', 'retry2', 'retry3']
          if (turnCount > phrase.length - 1) {
            return phrase[phrase.length - 1]
          }
          return phrase[turnCount]
        },
        validate: (value) => {
          if (value === 'hao' || value === 'Hao') {
            return { valid: false, reason: `${value} is not a good name.`}
          }
          return { valid: true, reason: null }
        },
        acknowledge: (value) => `ok! name is set to ${value}.`
      },
      {
        entity: 'alarmTime',
        type: 'string',
        query: 'What is the time you want to set?',
        acknowledge: (value) => `ok! time is set to ${value}.`
      }
    ]
  },
  {
    name: 'removeAlarm',
    slots: [
      {
        entity: 'alarmName',
        type: 'string',
        query: 'What is the name of the alarm you would like to remove?'
      }
    ]
  },
  {
    name: 'listAlarms',
    slots: []
  },
  {
    name: 'listAbilities',
    slots: []
  }
]
