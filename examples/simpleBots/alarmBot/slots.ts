import { randomElement } from '../../../src/helpers'
import { Slot, AllSyncStorageLayer } from '../../../src/types'
import { UserState } from './abilities'

export type StorageLayerType<T> = AllSyncStorageLayer<T>

export default [
    {
      name: 'alarmName',
      query: () => { return 'What is the name of the alarm?' },
      retry: (convoState, submittedData, turnCount) => {
        const phrase = [`Please try a new name (attempt: ${turnCount})`, `Try harder.. (attempt: ${turnCount})`]
        if (turnCount > phrase.length - 1) {
          return phrase[phrase.length - 1]
        }
        return phrase[turnCount]
      },
      validate: (value) => {
        if (value.toLowerCase() === 'hao') {
          return { isValid: false, reason: `${value} is not a good alarm name.` }
        }
        return { isValid: true, reason: null }
      },
      onFill: (value) => `ok! name is set to ${value}.`
    },
    {
      name: 'alarmTime',
      query: () => { return 'What is the time you want to set?' },
      retry: (convoState, submittedData, turnCount) => {
        const phrases: string[] = ['let\'s try again', 'what is the time you want to set?']
        return randomElement(phrases)
      },
      validate: (value: string) => {
        if (!value.toLowerCase().endsWith('pm') && !value.toLowerCase().endsWith('am')) {
          return {
            isValid: false,
            reason: 'Needs to set PM or AM',
          }
        }
        return {
          isValid: true
        }
      },
      onFill: (value) => `ok! time is set to ${value}.`
    }
  ] as Slot<StorageLayerType<UserState>>[]