// /* global test */
import * as wolf from '..'
import { getInitialWolfState, createStorage } from './testHelpers'
import greetAbility from './testAbilities/greetAbility'
import { UserConvoState } from './testAbilities/greetAbility'

const abilities: wolf.Ability<UserConvoState>[] = [
  greetAbility
]

const defaultStore: UserConvoState = {
  name: null
}

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

describe('Greet', () => { // Feature (ability)
  test('Basic Greet Flow', async () => {

    const outputResult = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: 'hi', entities: [], intent: 'greet' }),
      () => abilities,
      'greet'
    )

    expect(outputResult.messageStringArray).toEqual(['What is your name?'])
    expect(convoStorage.read()).toEqual({ 'name': null })

    const outputResult2 = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: 'Hao', entities: [], intent: null }),
      () => abilities,
      'greet'
    )

    // expect(outputResult2.messageStringArray).toEqual(['Hello Hao!'])
    // expect(convoStorage.read()).toEqual({name: 'Hao'})

    const outputResult3 = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: '3', entities: [], intent: null }),
      () => abilities,
      'greet'
    )

    const outputResult4 = await wolf.run(
      wolfStorage,
      convoStorage,
      () => ({ message: '30', entities: [], intent: null }),
      () => abilities,
      'greet'
    )

    expect(outputResult4.messageStringArray).toEqual(['Hello Hao who is 30!'])
    expect(convoStorage.read()).toEqual({ name: 'Hao' })

  })
})
