import { Ability } from '../../types'

export interface UserConvoState {
  name: string | null
}

export default {
  name: 'greet',
  slots: [
    {
      name: 'name',
      query: () => 'What is your name?',
      retry: () => 'try again',
      validate: () => ({ isValid: true, reason: null }),
      onFill: () => { return }
    },
    {
      name: 'age',
      query: () => 'What is your age?',
      retry: () => 'try again',
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
  onComplete: (convoState, submittedData: any) => {
    convoState.name = submittedData.name
    return `Hello ${submittedData.name} who is ${submittedData.age}!`
  }
} as Ability<UserConvoState>
