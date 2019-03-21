import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest, StorageLayerType } from '../helpers'
import { WolfStateStorage } from '../../types'

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
    name: 'greeting',
    traces: [
        {
            slotName: 'firstName'
        }
    ],
  //  nextAbility: () => ({abilityName: 'customerOrder'}),
    onComplete: (submittedData, convoStorageLayer) => {
        const convoState = convoStorageLayer.read()
        const newState = {
            firstName: submittedData.firstName,
            order: convoState.order
        }
        convoStorageLayer.save(newState)
        return 'Hello ' + submittedData.firstName
    }
}, {
    name: 'customerOrder',
    traces: [
        {
            slotName: 'order'
        }
    ],
    onComplete: (submittedData, convoStorageLayer) => {
        const convoState = convoStorageLayer.read()
        const newState = {
            firstName: convoState.firstName,
            order: submittedData.order
        }
        convoStorageLayer.save(newState)
        return 'Ok I got a ' + submittedData.order + ' for ' + convoState.firstName
    }
}] as wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[]

const wolfStorage: WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const testCase: TestCase<UserConvoState, StorageLayerType<UserConvoState>> = {
    description: 'Testing filling ',
    flow: { abilities, slots },
    defaultAbility: 'greeting',
    wolfStorage,
    convoStorage,
    conversationTurns: [
        {
            input: [{
                message: 'hey I am Gabby',
                entities: [
                    { name: 'firstName', text: 'Gabby', value: 'Gabby' }
                ],
                intent: 'greeting'
            }],
            expected: {
                message: ['Hello Gabby', 'What kind of pizza would you like?'],
                state: { firstName: 'Gabby', order: null }
            }
        },
        {
            input: [{
                message: 'My name is Hao',
                entities: [
                    { name: 'firstName', text: 'Hao', value: 'Hao' },
                ],
                intent: 'greeting'
            }],
            expected: {
                message: ['Hello Hao', 'What kind of pizza would you like?'],
                state: { firstName: 'Hao', order: null }
            }
        },
        {
            input: [{
                message: 'I want a pepperoni pizza',
                entities: [
                    { name: 'order', text: 'pepperoni pizza', value: 'pepperoni pizza' }
                ],
                intent: 'customerOrder'
            }],
            expected: {
                message: ['Ok I got a pepperoni pizza for Hao'],
                state: { firstName: 'Hao', order: 'pepperoni pizza' }
            }
        }
    ]
}

describe('Testing getValue Function', () => {
    runTest(test, testCase)
})