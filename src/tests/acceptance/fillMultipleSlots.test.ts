import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest, StorageLayerType } from '../helpers'

interface UserConvoState {
  firstName: string | null,
  order: string | null,

}

const defaultStore: UserConvoState = {
  firstName: null,
  order: null,
}

const slots: wolf.Slot<StorageLayerType<UserConvoState>>[] = [
  {
    name: 'firstName',
    query: () => 'What is your first name?'
  },
  {
    name: 'order',
    query: () => 'What kind of pizza would you like?'
  }
]

const abilities: wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[] = [{
  name: 'customerOrder',
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
      slotName: 'order'
    }
  ],
  onComplete: (submittedData, convoStorageLayer) => {
    const convoState = convoStorageLayer.read()
    const newState = {
      firstName: submittedData.firstName,
      order: submittedData.order
    }
    convoStorageLayer.save(newState)
    return 'Ok I got a ' + submittedData.order + ' for ' + submittedData.firstName
  }
}] as wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[]

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const testCase: TestCase<UserConvoState, StorageLayerType<UserConvoState>> = {
  description: 'Testing filling ',
  flow: { abilities, slots },
  defaultAbility: 'customerOrder',
  wolfStorage,
  convoStorage,
  conversationTurns: [
    {
      input: [{
        message: 'hey I am Gabby and I would like a pepperoni pizza',
        entities: [
          { name: 'firstName', text: 'hey I am Gabby and I would like a pepperoni pizza', value: 'Gabby' },
          { name: 'order', text: 'hey I am Gabby and I would like a pepperoni pizza', value: 'pepperoni pizza' }
        ],
        intent: 'customerOrder'
      }],
      expected: {
        message: ['Ok I got a pepperoni pizza for Gabby'],
        state: { firstName: 'Gabby', order: 'pepperoni pizza' }
      }
    }
  ]
}

describe('Testing getValue Function', () => {
  runTest(test, testCase)
})
