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
    }
  ],
  onComplete: (convoState: ConvoState, submittedData) => {
    convoState.name = submittedData.name
    return `Hello ${submittedData.name}!`
  }
} as Ability