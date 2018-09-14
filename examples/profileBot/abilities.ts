import { Ability } from '../../src/types'

export default [
  {
    name: 'greet',
    slots: [
      {
        name: 'name',
        query: () => 'what is your name?',
        validate: () =>  ({
          isValid: true,
          reason: null
        }),
        retry: () => 'try again',
        onFill: () => null
      }
    ],
    nextAbility: () => ({
      abilityName: 'profile',
      message: 'let\'s learn more about you'
    }),
    onComplete: (convoState, data) => {
      const { name } = data
      convoState.name = name
      return `Oh! Hello!! ${name}`
    }
  },
  {
    name: 'profile',
    onComplete: (convoState, data) => {
      convoState.profile = {
        ...data,
        name: convoState.name
      }
      return 'thank you for giving me your info'
    },
    slots: [
      {
        name: 'age',
        query: () => 'How old are you?',
        validate: (value: any) => {
          if (isNaN(+value)) {
            return {
              isValid: false,
              reason: 'It has to be a number.'
            }
          }
          return {
            isValid: true,
            reason: null
          }
        },
        onFill: (submittedValue, convoState, {setSlotValue, setSlotEnabled}, {requireConfirmation}) => {
          return 'thank you'
        },
        retry: () => 'try again'
      },
      {
        name: 'date',
        query: () => 'What is your birthday?',
        onFill: () => {
          return 'ok'
        }
      }
    ]
  }
] as Ability[]
