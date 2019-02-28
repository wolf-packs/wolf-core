import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest, StorageLayerType } from '../helpers'
import { StorageLayer } from '../../types';

interface UserConvoState {
  firstName: string | null,
  car: string | null,
  addOns: string[],
  financing: boolean
}

const defaultStore: UserConvoState = {
  firstName: null,
  car: null,
  addOns: [],
  financing: false
}

const slots: wolf.Slot<StorageLayerType<UserConvoState>>[] = [
  {
    name: 'firstName',
    query: () => 'What is your first name?'
  },
  {
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
  }
]

const abilities: wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[] = [{
  name: 'buyCar',
  traces: [
    {
      slotName: 'firstName'
    },
    {
      slotName: 'car'
    }
  ],
  onComplete: (submittedData, convoStorageLayer) => {
    const convoState = convoStorageLayer.read()
    const newState = {
      firstName: submittedData.firstName,
      car: submittedData.car,
      addOns: convoState.addOns.map(_ => _),
      financing: convoState.financing
    }
    convoStorageLayer.save(newState)
    return 'ok cool'
  }
}, {
  name: 'buyAddOn',
  traces: [
    {
      slotName: 'firstName',
      getValue: (records) => {
        // Search the slot records for an existing value for the slot 'firstName'
        // If the slot has been filled within this conversation session.. utilize the value
        // for this slot.
        const result = records.find(record => record.slotName === 'firstName')
        if (!result) {
          return null
        }
        return result.value
      }
    },
    {
      slotName: 'addOn'
    }
  ],
  nextAbility: () => ({abilityName: 'needFinancing', message: 'Ok! lets go to the next step.'}),
  onComplete: (submittedData, convoStorageLayer) => {
    const convoState = convoStorageLayer.read()
    let addOnsValue = convoState.addOns.map(_ => _)
    addOnsValue.push(submittedData.addOn)
    const newState = {
      firstName: submittedData.firstName,
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
      firstName: convoState.firstName,
      car: convoState.car,
      addOns: convoState.addOns.map(_ => _),
      financing: financingValue
    }
    convoStorageLayer.save(newState)
  }
}] as wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[]

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const testCase: TestCase<UserConvoState, StorageLayerType<UserConvoState>> = {
  description: 'Testing getValue',
  flow: { abilities, slots },
  defaultAbility: 'buyCar',
  wolfStorage,
  convoStorage,
  conversationTurns: [
    {
      input: [{
        message: 'i want to buy a Tesla',
        entities: [{ name: 'car', text: 'tesla', value: 'tesla' }],
        intent: 'buyCar'
      }],
      expected: {
        message: ['What is your first name?'],
        state: {firstName: null, car: null, addOns: [], financing: false }
      }
    },
    {
      input: [{
        message: 'john',
        entities: [],
        intent: null,
      }],
      expected: {
        message: ['ok cool'],
        state: { firstName: 'john', car: 'tesla', addOns: [], financing: false }
      }
    },
    {
      input: [{
        message: 'I want some addons',
        entities: [],
        intent: 'buyAddOn'
      }],
      expected: {
        message: ['What add on would you like?'],
        state: {firstName: 'john', car: 'tesla', addOns: [], financing: false}
      }
    },
    {
      input: [{
        message: 'all wheel drive',
        entities: [],
        intent: null
      }],
      expected: {
        message: ['Ok! lets go to the next step.', 'Would you need financing?'],
        state: { firstName: 'john', car: 'tesla', addOns: ['all wheel drive'], financing: false }
      }
    },
    {
      input: [{
        message: 'yes',
        entities: [],
        intent: null
      }],
      expected: {
        message: [],
        state: { firstName: 'john', car: 'tesla', addOns: ['all wheel drive'], financing: true }
      }
    }
  ]
}

describe('Testing getValue Function', () => {
  runTest(test, testCase)
})
