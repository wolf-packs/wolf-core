import { Ability } from '../../../types'
import { StorageLayerType } from '../../helpers';

export interface UserConvoState {
  name: string | null
}

export default {
  name: 'greet',
  slots: [
    {
      name: 'name',
      query: () => 'What is your name?',
    },
    {
      name: 'age',
      query: () => 'What is your age?',
      retry: () => 'You must be older than 5.',
      validate: (submittedValue: any) => {
        const num = parseInt(submittedValue, 10);
        if (num < 6) {
          return { isValid: false, reason: 'too young' }
        }
        return { isValid: true, reason: null }
      },
      onFill: () => { return }
    }
  ],
  onComplete: (convoStorageLayer, submittedData: any) => {
    const convoState = convoStorageLayer.read()
    convoState.name = submittedData.name
    return `Hello ${submittedData.name} who is ${submittedData.age}!`
  }
} as Ability<UserConvoState, StorageLayerType<UserConvoState>>
