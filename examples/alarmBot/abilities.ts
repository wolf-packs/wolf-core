import { randomElement } from '../../src/helpers'
import { Ability } from '../../src/types'

export default [
  {
    name: 'addAlarm',
    slots: [
      {
        name: 'alarmName',
        type: 'string',
        query: () => { return 'What is the name of the alarm?'},
        retry: (turnCount) => {
          const phrase = ['Please try a new name (attempt: 2)', 'Try harder.. (attempt: 3)']
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
        onFill: (value) => `ok! name is set to ${value}.`
      },
      {
        name: 'alarmTime',
        type: 'string',
        query: () => { return 'What is the time you want to set?' },
        retry: (turnCount) => {
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
        onFill: (value) => `ok! time is set to ${value}.`
      }
    ],
    onComplete: ({ getSubmittedData, getConvoState }) => {
      return new Promise((resolve, reject) => {
        const value = getSubmittedData()

        const convoState = getConvoState()
        const alarms = convoState.alarms || []
        convoState.alarms = [
          ...alarms,
          value          
        ]                                             
        
        setTimeout(() => {
          resolve(`Your ${value.alarmName} alarm is added!`)
        }, 2000)
      })
    }
  },
  {
    name: 'removeAlarm',
    slots: [
      {
        name: 'alarmName',
        type: 'string',
        query: () => {
          return 'What is the name of the alarm you would like to remove?'
        }
      }
    ],
    onComplete: ({ getSubmittedData, getConvoState }) => {
      const convoState = getConvoState()
      const { alarmName } = getSubmittedData()
      const stateAlarms = convoState.alarms || []

      // Check if alarm name exists
      if (!stateAlarms.some((alarm) => alarm.alarmName === alarmName)) {
        return `There is no alarm with name ${alarmName}`
      }

      // Remove alarm
      const alarms = stateAlarms.filter(alarm => alarm.alarmName !== alarmName)
      convoState.alarms = alarms
      return `The ${alarmName} has been removed`                                                
    }
  },
  {
    name: 'listAlarms',
    slots: [],
    onComplete: ({ getConvoState }) => {
      const convoState = getConvoState()
      const alarms = convoState.alarms || []

      if (alarms.length === 0) {
        return `You do not have any alarms!`
      }
      return alarms.map(alarms => alarms.alarmName + ' at ' + alarms.alarmTime).join(', ')
    }
  },
  {
    name: 'listAbilities',
    slots: [],
    onComplete: ({ getAbilityList }) => {
      const abilityList = getAbilityList()
      const abilities = abilityList.map((ability) => ability.name).join(', ')
      const message = `Here are my abilities: ${abilities}`
      return message
    }
  }
] as Ability[]
