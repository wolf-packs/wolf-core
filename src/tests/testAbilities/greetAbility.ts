import { Ability, ConvoState } from '../../types'

export default {
  name: 'greet',
  slots: [
    {
      name: 'name',
      query: () => 'What is your name?',
      retry: () => 'try again',
      validate: () => ({isValid: true, reason: null}),
      onFill: () => {return}
    },
    {
      name: 'age',
      query: () => 'What is your age?',
      retry: () => 'try again',
      validate: (submittedValue) => {
        const number = parseInt(submittedValue, 10);
        if (number < 6) {
          return {isValid: false, reason: 'too young'}
        }
        return {isValid: true, reason: null}
      },
      onFill: () => {return}
    }
  ],
  onComplete: (convoState: ConvoState, submittedData) => {
    convoState.name = submittedData.name
    return `Hello ${submittedData.name} who is ${submittedData.age}!`
  }
} as Ability