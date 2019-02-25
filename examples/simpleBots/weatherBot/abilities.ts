// import { Ability } from '../../../src/types'

// export interface UserState {
//   name: string | null
// }

// export const abilities = [
//   {
//     name: 'greet',
//     slots: [
//       {
//         name: 'name',
//         query: () => 'what is your name?',
//         validate: () => ({
//           isValid: true,
//           reason: null
//         }),
//         retry: () => 'try again',
//         onFill: () => null
//       }
//     ],
//     nextAbility: () => {
//       return {
//         abilityName: 'weather',
//         message: `nice, lets check the weather now.`
//       }
//     },
//     onComplete: (convoState, data) => {
//       const { name } = data
//       convoState.name = name
//       return `Oh! Hello ${name!}`
//     }
//   },
//   {
//     name: 'weather',
//     onComplete: (convoState, data) => {
//       const { city } = data
//       return `looks like ${city} is looking good!`
//     },
//     slots: [
//       {
//         name: 'city',
//         query: () => 'what is the city?',
//         validate: (value: any) => {
//           if (value.toLowerCase() === 'chicago' || value.toLowerCase() === 'seattle') {
//             return {
//               isValid: true,
//               reason: null
//             }
//           }
//           return {
//             isValid: false,
//             reason: 'I can only look up chicago or seattle'
//           }
//         },
//         onFill: (submittedValue, convoState, { setSlotValue, setSlotEnabled }, { requireConfirmation }) => {
//           // looks for if confirmCity's value on the state, 
//           // if set, return setValue
//           // if not set, next slot query to confirmCity

//           requireConfirmation('confirmCity')

//           return null
//         },
//         retry: () => 'try again'
//       },
//       {
//         name: 'confirmCity',
//         query: (convoState, { getSlotValue }) =>
//           `are you sure you want to set the city to ${getSlotValue('city')!.value}`,
//         validate: (value) => {
//           if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'no') {
//             return {
//               isValid: true,
//               reason: null
//             }
//           }
//           return {
//             isValid: false,
//             reason: 'You have to say yes or no'
//           }
//         },
//         onFill: (submittedValue, convoState, { setSlotValue, setSlotEnabled }, { accept, deny }) => {
//           if (submittedValue === 'yes') {
//             accept()
//           } else {
//             deny()
//           }
//         },
//         retry: () => ''
//       },
//       {
//         name: 'date',
//         query: () => 'What day would you like me to look up?',

//       }
//     ]
//   }
// ] as Ability<UserState>[]
