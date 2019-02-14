import { Ability } from '../../../types'

export interface UserConvoState {
  animalName: string | null,
  magicWordStrict: string | null,
  magicWordStrict2: string | null
}

export default {
  name: 'magicWord',
  slots: [
    {
      name: 'animalName',
      query: () => 'Please name an animal... if you want.',
    },
    {
      name: 'magicWordStrict',
      query: () => 'Please say \'wolf\'... not negotiable.',
      validate: (submittedValue: any) => {
        if (submittedValue !== 'wolf') {
          return { isValid: false, reason: 'Please follow directions.' }
        }
        return { isValid: true, reason: null }
      },
    },
    {
      name: 'magicWordStrict2',
      query: () => 'Please say \'wolf\' one more time.',
      retry: () => 'You must say \'wolf\' a second time',
      validate: (submittedValue: any) => {
        if (submittedValue !== 'wolf') {
          return { isValid: false, reason: 'Please follow directions.' }
        }
        return { isValid: true, reason: null }
      },
      onFill: () => {
        return 'Thank you for saying wolf wolf!'
      }
    }
  ],
  onComplete: (convoState, submittedData: any) => {
    convoState.animalName = submittedData.animalName
    convoState.magicWordStrict = submittedData.magicWordStrict
    convoState.magicWordStrict2 = submittedData.magicWordStrict2

    return `You said: '${submittedData.animalName}', \
'${submittedData.magicWordStrict}', \
'${submittedData.magicWordStrict2}'!`
  }
} as Ability<UserConvoState>
