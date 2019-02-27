import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest, StorageLayerType } from '../helpers'
import { StorageLayer } from '../../types';

interface UserConvoState {
  car: string | null,
  addOns: string[],
  financing: boolean
}

const defaultStore: UserConvoState = {
  car: null,
  addOns: [],
  financing: false
}

const slots: wolf.Slot<StorageLayerType<UserConvoState>>[] = [{
  name: 'car',
  query: () => 'what kind of car would you like?'
},
{
  name: 'addOn',
  query: () => 'What add on would you like?',
  validate: (submittedValue) => {
    if (submittedValue !== 'nothing') {
      return { isValid: true, reason: null }
    }
    return { isValid: false, reason: 'Can not be \'nothing\'!' }
  }
},
{
  name: 'confirmFinancing',
  query: () => 'Would you need financing?'
}]

const abilities: wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[] = [{
  name: 'buyCar',
  traces: [{
    slotName: 'car'
  }],
  nextAbility: () => ({ abilityName: 'buyAddOn' }),
  onComplete: (submittedData, convoStorageLayer) => {
    const convoState = convoStorageLayer.read()
    const newState = {
      car: submittedData.car,
      addOns: convoState.addOns.map(_ => _),
      financing: convoState.financing
    }
    convoStorageLayer.save(newState)
  }
}, {
  name: 'buyAddOn',
  traces: [{
    slotName: 'addOn'
  }],
  nextAbility: () => ({ abilityName: 'needFinancing', message: 'Ok! lets go to the next step.' }),
  onComplete: (submittedData, convoStorageLayer) => {
    const convoState = convoStorageLayer.read()
    let addOnsValue = convoState.addOns.map(_ => _)
    addOnsValue.push(submittedData.addOn)
    const newState = {
      car: convoState.car,
      addOns: addOnsValue,
      financing: convoState.financing
    }
    convoStorageLayer.save(newState)
  }
}, {
  name: 'needFinancing',
  traces: [{
    slotName: 'confirmFinancing'
  }],
  onComplete: (submittedData, convoStorageLayer) => {
    const convoState = convoStorageLayer.read()
    let financingValue = false
    if (submittedData.confirmFinancing === 'yes') {
      financingValue = true
    }

    const newState = {
      car: convoState.car,
      addOns: convoState.addOns.map(_ => _),
      financing: financingValue
    }
    convoStorageLayer.save(newState)
  }
}] as wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[]

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const optionalAbilityPropertyTestCase: TestCase<UserConvoState, StorageLayerType<UserConvoState>> = {
  description: 'Optional Ability Properties',
  abilities: abilities,
  slots: slots,
  defaultAbility: 'buyCar',
  wolfStorage,
  convoStorage,
  conversationTurns: [
    {
      input: {
        message: 'i want to buy a Tesla',
        entities: [{ name: 'car', text: 'tesla', value: 'tesla' }],
        intent: 'buyCar'
      },
      expected: {
        message: ['What add on would you like?'],
        state: { car: 'tesla', addOns: [], financing: false }
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
        state: { car: 'tesla', addOns: ['all wheel drive'], financing: false }
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
        state: { car: 'tesla', addOns: ['all wheel drive'], financing: true }
      }
    }
  ]
}

describe('Optional Ability Properties', () => {
  runTest(test, optionalAbilityPropertyTestCase)
})
