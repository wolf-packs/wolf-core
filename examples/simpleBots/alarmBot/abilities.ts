import { Ability, AllSyncStorageLayer } from '../../../src/types'
export type StorageLayerType<T> = AllSyncStorageLayer<T>

interface Alarm {
  alarmName: string,
  alarmTime: string
}

export interface UserState {
  alarms: Alarm[]
}

export default [
  {
    name: 'addAlarm',
    traces: [{
      slotName: 'alarmName'
    },
    {
      slotName: 'alarmTime'
    }],
    onComplete: (submittedData, convoStorageLayer) => {
      return new Promise((resolve, reject) => {
        const convoState = convoStorageLayer.read()
        const value = submittedData
        const prevAlarms = convoState.alarms || []
        const newState = {
          alarms: [
            ...prevAlarms,
            value
          ]
        }

        convoStorageLayer.save(newState)

        setTimeout(() => {
          resolve(`Your ${value.alarmName} is added!`)
        }, 500)
      })
    }
  },
  {
    name: 'removeAlarm',
    traces: [
      {
        slotName: 'alarmName'
      }
    ],
    onComplete: (submittedData, convoStorageLayer) => {
      const { alarmName } = submittedData
      const convoState = convoStorageLayer.read()
      const stateAlarms = convoState.alarms || []

      // Check if alarm name exists
      if (!stateAlarms.some((alarm: Alarm) => alarm.alarmName === alarmName)) {
        return `There is no alarm with name ${alarmName}.`
      }

      // Remove alarm
      const newAlarms = stateAlarms.filter((alarm: Alarm) => alarm.alarmName !== alarmName)
      const newState = {
        alarms: newAlarms
      }

      convoStorageLayer.save(newState)

      return `The ${alarmName} has been removed.`
    }
  },
  {
    name: 'listAlarms',
    traces: [],
    onComplete: (submittedData, convoStorageLayer) => {
      const convoState = convoStorageLayer.read()
      const alarms = convoState.alarms || []

      if (alarms.length === 0) {
        return `You do not have any alarms!`
      }
      return alarms.map((alarms: Alarm) => alarms.alarmName + ' at ' + alarms.alarmTime).join(', ')
    }
  },
  {
    name: 'listAbility',
    traces: [],
    onComplete: (submittedData, convoStorageLayer, { getAbilityList }) => {
      const abilityList = getAbilityList()
      const abilities = abilityList.map((ability) => ability.name).join(', ')
      const message = `Here are my abilities: ${abilities}`
      return message
    }
  }
] as Ability<UserState, StorageLayerType<UserState>>[]
