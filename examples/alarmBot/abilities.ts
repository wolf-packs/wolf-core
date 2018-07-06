import { randomElement } from '../../src/helpers'
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
          if (value.toLowerCase() === 'hao') {
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
        retryQuery: (turn) => {
          const phrases: string[] = ['let\'s try again', 'what is the time you want to set?']
          return randomElement(phrases)
        },
        validate: (value: string) => {
          if (!value.toLowerCase().endsWith('pm') && !value.toLowerCase().endsWith('am')) {
            return {
              valid: false,
              reason: 'Needs to set PM or AM',
            }
          }
          return {
            valid: true
          }
        },
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
