import { Ability, Slot } from '../../src/types'

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
    onComplete: ({getSubmittedData}) => {
      const { name } = getSubmittedData()
      return `Oh! Hello ${name!}`
    }
  },
  {
    name: 'weather',

    slots: [
      {
        name: 'city',
        query: () => 'what is the city?',
        validate: (value: string) => {
          if (value.toLowerCase() === 'chicago' || value.toLowerCase() === 'seattle') {
            return {
              isValid: true,
              reason: null
            }
          }
          return {
            isValid: false,
            reason: 'I can only look up chicago or seattle'
          }
        },
        onFill: (submittedValue, convoState, {setSlotValue, setSlotEnabled}, {requireConfirmation}) => {
          // looks for if confirmCity's value on the state, 
          // if set, return setValue
          // if not set, next slot query to confirmCity

          requireConfirmation('confirmCity')

          return null
        },
        retry: () => 'try again'
      },
      {
        name: 'confirmCity',
        query: ({getSlotValues}) => `are you sure you want to set the city to ${getSlotValues().city}`,
        onFill: (submittedValue, convoState, {setSlotValue, setSlotEnabled}, {accept, deny}) => {
          if (submittedValue) {
            accept()
          } else {
            deny() 
          }
        },
        retry: () => ''
      },
      {
        name: 'date',
        query: () => 'What day would you like me to look up?',

      }
    ]
  }
] as Ability[]
