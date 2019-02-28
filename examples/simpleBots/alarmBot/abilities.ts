import { randomElement } from '../../../src/helpers'
import { Ability } from '../../../src/types'
import { StorageLayerType } from '../../../src';

interface Alarm {
  alarmName: string,
  alarmTime: string
}

export interface UserState {
    alarms: Alarm[]
  }

export const abilities = [
  {
    name: 'addAlarm',
    traces: [],
    onComplete: (convoState, submittedData) => {
      return new Promise((resolve, reject) => {
        const value = submittedData
        const alarms = convoState.alarms || []
        convoState.alarms = [
          ...alarms,
          value
        ]

        setTimeout(() => {
          resolve(`Your ${value.alarmName} is added!`)
        }, 500)
      })
    }
  },
  {
    name: 'removeAlarm',
    slots: [
      {
        name: 'alarmName',
        query: () => {
          return 'What is the name of the alarm you would like to remove?'
        }
      }
    ],
    onComplete: (convoState, submittedData) => {
      const { alarmName } = submittedData
      const stateAlarms = convoState.alarms || []

      // Check if alarm name exists
      if (!stateAlarms.some((alarm: Alarm) => alarm.alarmName === alarmName)) {
        return `There is no alarm with name ${alarmName}.`
      }

      // Remove alarm
      const alarms = stateAlarms.filter((alarm: Alarm) => alarm.alarmName !== alarmName)
      convoState.alarms = alarms
      return `The ${alarmName} has been removed.`
    }
  },
  {
    name: 'listAlarms',
    slots: [],
    onComplete: (convoState) => {
      const alarms = convoState.alarms || []

      if (alarms.length === 0) {
        return `You do not have any alarms!`
      }
      return alarms.map((alarms: Alarm) => alarms.alarmName + ' at ' + alarms.alarmTime).join(', ')
    }
  },
  {
    name: 'listAbility',
    slots: [],
    onComplete: (convoState, submittedData, { getAbilityList }) => {
      const abilityList = getAbilityList()
      const abilities = abilityList.map((ability) => ability.name).join(', ')
      const message = `Here are my abilities: ${abilities}`
      return message
    }
  }
] as Ability<UserState, StorageLayerType<UserState>>[]
