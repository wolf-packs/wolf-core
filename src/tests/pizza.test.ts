/* global test */
import { createWolfStore } from '../index'
import { mockWolfRunner, getInitialWolfState } from './testHelpers'
import { WolfState, NlpResult, Ability } from '../types'
import greetAbility from './testAbilities/greetAbility'

const abilities: Ability[] = [
  greetAbility
]

describe('Greet', () => { // Feature (ability)
  test('Basic Greet Flow', async () => {
    const startingWolfState: WolfState = getInitialWolfState()
    const convoState = {}

    const {outtakeResult: result1, wolfState: state1} = await mockWolfRunner(
      convoState,
      startingWolfState,
      {message: 'hi', entities: [], intent: 'greet'},
      abilities,
      'greet',
      createWolfStore()
    )
    
    expect(result1.messageStringArray).toEqual(['What is your name?'])
    expect(convoState).toEqual({})

    const {outtakeResult: result2, wolfState: state2} = await mockWolfRunner(
      convoState,
      state1,
      {message: 'Hao', entities: [], intent: null},
      abilities,
      'greet',
      createWolfStore()
    )
    expect(result2.messageStringArray).toEqual(['Hello Hao!'])
    expect(convoState).toEqual({name: 'Hao'})

  })
})
