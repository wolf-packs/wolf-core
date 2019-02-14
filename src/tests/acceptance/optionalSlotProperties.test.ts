import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest } from '../helpers'
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

const optionalSlotPropertyTestCase: TestCase<UserConvoState> = {
  description: 'Optional Slot Properties',
  abilities: abilities,
  defaultAbility: 'magicWord',
  wolfStorage,
  convoStorage,
  conversationTurns: [
    {
      input: { message: 'hello', entities: [], intent: 'magicWord' },
      expected: {
        message: ['Please name an animal... if you want.'],
        state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
      }
    },
    {
      input: { message: 'hippo', entities: [], intent: 'magicWord' },
      expected: {
        message: ['Please say \'wolf\'... not negotiable.'],
        state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
      }
    },
    {
      input: { message: 'hippo', entities: [], intent: 'magicWord' },
      expected: {
        message: ['Please follow directions.'],
        state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
      }
    },
    {
      input: { message: 'wolf', entities: [], intent: 'magicWord' },
      expected: {
        message: ['Please say \'wolf\' one more time.'],
        state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
      }
    },
    {
      input: { message: 'hippo', entities: [], intent: 'magicWord' },
      expected: {
        message: [
          'Please follow directions.',
          'You must say \'wolf\' a second time'
        ],
        state: { 'animalName': null, 'magicWordStrict': null, 'magicWordStrict2': null }
      }
    },
    {
      input: { message: 'wolf', entities: [], intent: 'magicWord' },
      expected: {
        message: [
          'Thank you for saying wolf wolf!',
          'You said: \'hippo\', \'wolf\', \'wolf\'!'
        ],
        state: {
          'animalName': 'hippo',
          'magicWordStrict': 'wolf',
          'magicWordStrict2': 'wolf'
        }
      }
    }
  ]
}

describe('Optional Slot Properties', () => {
  runTest(test, optionalSlotPropertyTestCase)
})
