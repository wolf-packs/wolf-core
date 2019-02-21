// /* global test */
import * as wolf from '../..'
import { getInitialWolfState, createStorage, StorageLayerType, TestCase, runTest } from '../helpers'

interface UserConvoState {
  name: string | null,
  age: string | null
}

const defaultStore: UserConvoState = {
  name: null,
  age: null
}

const abilities: wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[] = [{
  name: 'greet',
  slots: [
    {
      name: 'name',
      query: () => 'What is your name?'
    },
    {
      name: 'age',
      query: () => 'What is your age?',
      retry: () => 'You must be older than 5.',
      validate: (submittedValue: any) => {
        const num = parseInt(submittedValue, 10);
        if (num < 6) {
          return { isValid: false, reason: 'too young' }
        }
        return { isValid: true, reason: null }
      }
    }
  ],
  onComplete: (convoStorageLayer, submittedData: any) => {
    const currState = convoStorageLayer.read()
    const newState = {
      name: submittedData.name,
      age: submittedData.age,
    }
    convoStorageLayer.save(newState)
    return `Hello ${submittedData.name} who is ${submittedData.age}!`
  }
}] as wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[]

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const greetTestCase: TestCase<UserConvoState, StorageLayerType<UserConvoState>> = {
  description: 'Greet',
  abilities: abilities,
  defaultAbility: 'greet',
  wolfStorage,
  convoStorage,
  conversationTurns: [
    {
      input: { message: 'hi', entities: [], intent: 'greet' },
      expected: {
        message: ['What is your name?'],
        state: { name: null, age: null }
      }
    },
    {
      input: { message: 'Hao', entities: [], intent: null },
      expected: {
        message: ['What is your age?'],
        state: { name: null, age: null }
      }
    },
    {
      input: { message: '3', entities: [], intent: null },
      expected: {
        message: ['too young', 'You must be older than 5.'],
        state: { name: null, age: null }
      }
    },
    {
      input: { message: '30', entities: [], intent: null },
      expected: {
        message: ['Hello Hao who is 30!'],
        state: { name: 'Hao', age: '30' }
      }
    }
  ]
}

describe('Basic Greet Flow Test', () => {
  runTest(test, greetTestCase)
})
