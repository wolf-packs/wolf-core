import * as wolf from '../..'
import { getInitialWolfState, createStorage } from '../helpers'
import optionalAbility from './testAbilities/optionalSlotPropertiesAbilities'
import { UserConvoState } from './testAbilities/optionalSlotPropertiesAbilities'

const abilities: wolf.Ability<UserConvoState>[] = [
  optionalAbility
]

const defaultStore: UserConvoState = {
  animalName: null,
  magicWordStrict: null,
  magicWordStrict2: null
}

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

// const conversationTurns = [
//   {
//     input: { message: 'hello', entities: [], intent: 'magicWord' },
//     expected: {
//       message: ['Please name an animal... if you want.'],
//       state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
//     }
//   },
//   {
//     input: { message: 'hippo', entities: [], intent: 'magicWord' },
//     expected: {
//       message: ['Please say \'wolf\'... not negotiable.'],
//       state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
//     }
//   },
//   {
//     input: { message: 'hippo', entities: [], intent: 'magicWord' },
//     expected: {
//       message: ['Please follow directions.'],
//       state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
//     }
//   },
//   {
//     input: { message: 'wolf', entities: [], intent: 'magicWord' },
//     expected: {
//       message: ['Please say \'wolf\' one more time.'],
//       state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
//     }
//   },
//   {
//     input: { message: 'hippo', entities: [], intent: 'magicWord' },
//     expected: {
//       message: [
//         'Please follow directions.',
//         'You must say \'wolf\' a second time'
//       ],
//       state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
//     }
//   },
//   {
//     input: { message: 'wolf', entities: [], intent: 'magicWord' },
//     expected: {
//       message: [
//         'Thank you for saying wolf wolf!',
//         'You said: \'hippo\', \'wolf\', \'wolf\'!'
//       ],
//       state: {
//         'animalName': 'hippo',
//         'magicWordStrict': 'wolf',
//         'magicWordStrict2': 'wolf'
//       }
//     }
//   }
// ]

describe('Optional Slot Properties', () => { // Feature (ability)
  test('Optional Slot Properties', async () => {

    // conversationTurns.forEach(async (turn) => {
    //   const outputResult = await wolf.run(
    //     wolfStorage,
    //     convoStorage,
    //     () => (turn.input),
    //     () => abilities,
    //     'magicWord'
    //   )

    //   expect(outputResult.messageStringArray).toEqual(turn.expected.message)
    //   expect(convoStorage.read()).toEqual(turn.expected.state)

    // })
    const outputResult = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: 'hello', entities: [], intent: 'magicWord' }),
      () => abilities,
      'magicWord'
    )

    expect(outputResult.messageStringArray).toEqual(['Please name an animal... if you want.'])
    expect(convoStorage.read()).toEqual({ 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null })

    const outputResult2 = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: 'hippo', entities: [], intent: 'magicWord' }),
      () => abilities,
      'magicWord'
    )

    expect(outputResult2.messageStringArray).toEqual(['Please say \'wolf\'... not negotiable.'])
    expect(convoStorage.read()).toEqual({ 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null })

    const outputResult3 = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: 'hippo', entities: [], intent: 'magicWord' }),
      () => abilities,
      'magicWord'
    )

    expect(outputResult3.messageStringArray).toEqual(['Please follow directions.'])
    expect(convoStorage.read()).toEqual({ 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null })

    const outputResult4 = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: 'wolf', entities: [], intent: 'magicWord' }),
      () => abilities,
      'magicWord'
    )

    expect(outputResult4.messageStringArray).toEqual(['Please say \'wolf\' one more time.'])
    expect(convoStorage.read()).toEqual({ 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null })

    const outputResult5 = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: 'hippo', entities: [], intent: 'magicWord' }),
      () => abilities,
      'magicWord'
    )

    expect(outputResult5.messageStringArray).toEqual([
      'Please follow directions.',
      'You must say \'wolf\' a second time'
    ])
    expect(convoStorage.read()).toEqual({ 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null })

    const outputResult6 = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: 'wolf', entities: [], intent: 'magicWord' }),
      () => abilities,
      'magicWord'
    )

    expect(outputResult6.messageStringArray).toEqual([
      'Thank you for saying wolf wolf!',
      'You said: \'hippo\', \'wolf\', \'wolf\'!'
    ])
    expect(convoStorage.read()).toEqual({
      'animalName': 'hippo',
      'magicWordStrict': 'wolf',
      'magicWordStrict2': 'wolf'
    })
  })
})
