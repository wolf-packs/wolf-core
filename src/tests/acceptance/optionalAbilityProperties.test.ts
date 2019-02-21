import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest, StorageLayerType } from '../helpers'
import { Ability } from '../../types'

interface UserConvoState {
  car: string | null,
  addons: string[],
  financing: boolean
}

const defaultStore: UserConvoState = {
  car: null,
  addons: [],
  financing: false
}

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const abilities: wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[] = [{
  name: 'buyCar',
  slots: [{
    name: 'car',
    query: () => 'what kind of car would you like?'
  }],
  nextAbility: () => ({abilityName: 'buyAddOn'}),
  onComplete: (convoStorageLayer, submittedData) => {
    const convoState = convoStorageLayer.read()
    convoState.car = submittedData.car
  }
}, {
  name: 'buyAddOn',
  slots: [{
    name: 'addOn',
    query: () => 'What add on would you like?'
  }],
  nextAbility: () => ({abilityName: 'needFinancing', message: 'Ok! lets go to the next step.'}),
  onComplete: (convoStorageLayer, submittedData) => {
    const convoState = convoStorageLayer.read()
    if (submittedData.addOn !== 'nothing') {
      convoState.addons.push(submittedData.addOn)
    }
  }
}, {
  name: 'needFinancing',
  slots: [{
    name: 'confirmFinancing',
    query: () => 'Would you need financing?'
  }],
  onComplete: (convoStorageLayer, submittedData) => {
    const convoState = convoStorageLayer.read()
    if (submittedData.confirmFinancing === 'yes') {
      convoState.financing = true
      return
    }
    convoState.financing = false
  }
}] as Ability<UserConvoState, StorageLayerType<UserConvoState>>[]

const optionalAbilityPropertyTestCase: TestCase<UserConvoState, StorageLayerType<UserConvoState>> = {
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
        state: { car: 'tesla', addons: [], financing: false }
      }
    },
    {
      input: {
        message: 'all wheel drive',
        entities: [],
        intent: null
      },
      expected: {
        message: ['Ok! lets go to the next step.', 'Would you need financing?'],
        state: { car: 'tesla', addons: ['all wheel drive'], financing: false }
      }
    },
    {
      input: {
        message: 'yes',
        entities: [],
        intent: null
      },
      expected: {
        message: [],
        state: { car: 'tesla', addons: ['all wheel drive'], financing: true }
      }
    }
  ]
}

describe('Optional Ability Properties', () => {
  runTest(test, optionalAbilityPropertyTestCase)
})
