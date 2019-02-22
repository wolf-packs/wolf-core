import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest, StorageLayerType } from '../helpers'
import { Ability } from '../../types'

interface UserConvoState {
    name: string | null,
    phrase: string | null // added "phrase" to learn more about wolf maintaining state
}

const defaultStore: UserConvoState = {
    name: null,
    phrase: null
}

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const abilities: wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[] = [
    {
        name: 'greet',
        slots: [{
            name: 'firstName',
            query: () => 'what is your name?',
            validate: () => ({ isValid: true, reason: null }),
            retry: () => '',
            onFill: () => { return; },
        }],
        onComplete: (convoStorageLayer, submittedData) => {
            const convoState = convoStorageLayer.read()
            const newState = {
                name: submittedData.firstName,
                phrase: convoState.phrase
            }
            convoStorageLayer.save(newState);
            return `hi ${submittedData.firstName}!`;
        },
    },
    {
        name: 'echo',
        slots: [],
        onComplete: (convoStorageLayer, submittedData, { getMessageData }) => {
            const messageData = getMessageData();
            const convoState = convoStorageLayer.read()
            const newState = {
                name: convoState.name,
                phrase: messageData.rawText
            }
            convoStorageLayer.save(newState)
            if (newState.name) {
                return `${newState.name} said "${newState.phrase}"`;
            }
            return `You said "${newState.phrase}"`;
        },
    },
] as wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[];

const retainStateTestCase: TestCase<UserConvoState, StorageLayerType<UserConvoState>> = {
    description: 'Retain State in EchoBot',
    abilities: abilities,
    defaultAbility: 'echo',
    wolfStorage,
    convoStorage,
    conversationTurns: [
        {
            input: {
                message: 'hello to the world as a phrase',
                entities: [], 
                intent: null
            },
            expected: {
                message: ['You said "hello to the world as a phrase"'],
                state: { name: null, phrase: 'hello to the world as a phrase' }
            }
        },
        {
            input: {
                message: 'hi',
                entities: [],
                intent: 'greet'
            },
            expected: {
                message: ['what is your name?'],
                state: { name: null, phrase: 'hello to the world as a phrase' }
            }
        },
        {
            input: {
                message: 'dave',
                entities: [], 
                intent: null, 
            },
            expected: {
                message: ['hi dave!'], 
                state: { name: 'dave', phrase: 'hello to the world as a phrase' }
            }
        },
        {
            input: {
                message: 'hello there',
                entities: [],
                intent: null
            },
            expected: {
                message: ['dave said "hello there"'],
                state: { name: 'dave', phrase: 'hello there' }
            }
        }
    ]
}

describe('Retain State in EchoBot', () => {
    runTest(test, retainStateTestCase)
})
