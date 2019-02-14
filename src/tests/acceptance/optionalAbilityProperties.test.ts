import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest } from '../helpers'
import optionalAbility from './testAbilities/optionalAbilityPropertiesAbilities'
import { UserConvoState } from './testAbilities/optionalAbilityPropertiesAbilities'

const abilities: wolf.Ability<UserConvoState>[] = optionalAbility

const defaultStore: UserConvoState = {
  car: null,
  addons: []
}

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const optionalAbilityPropertyTestCase: TestCase<UserConvoState> = {
  description: 'Optional Ability Properties',
  abilities: abilities,
  defaultAbility: 'buyCar',
  wolfStorage,
  convoStorage,
  conversationTurns: [
    {
      input: { 
        message: 'i want to buy a Tesla', 
        entities: [{name: 'car', text: 'tesla', value: 'tesla'}], 
        intent: 'buyCar'
      },
      expected: {
        message: ['What add on would you like?'],
        state: { car: 'tesla', addons: [] }
      }
    },
    {
      input: {
        message: 'all wheel drive',
        entities: [],
        intent: null
      },
      expected: {
        message: [],
        state: { car: 'tesla', addons: ['all wheel drive']}
      }
    }
  ]
}

describe('Optional Ability Properties', () => {
  runTest(test, optionalAbilityPropertyTestCase)
})
