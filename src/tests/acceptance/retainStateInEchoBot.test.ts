import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest } from '../helpers'
import { Ability } from '../../types'

interface UserConvoState {
    name: string | null,
    phrase: string | null // added "phrase" to learn more about wolf-state
}

const defaultStore: UserConvoState = {
    name: null,
    phrase: null
}

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const abilities: wolf.Ability<UserConvoState>[] = [
    {
        name: 'greet',
        slots: [{
            name: 'firstName',
            query: () => 'what is your name?',
            validate: () => ({ isValid: true, reason: null }),
            retry: () => '',
            onFill: () => { return; },
        }],
        // nextAbility: () => ({abilityName: 'echo', message: 'Ok! lets go to the next step.'}),
        onComplete: (convoState, submittedData) => {
            convoState.name = submittedData.firstName;
            return `hi ${submittedData.firstName}!`;
        },
    },
    {
        name: 'echo',
        // slots: [{
        //     name: 'phrase',
        //     query: () => 'what did you say?',
        //     validate: () => ({ isValid: true, reason: null }),
        //     retry: () => '',
        //     onFill: () => { return; },
        // }],
        slots: [],
        onComplete: (convoState, submittedData, { getMessageData }) => {
            const messageData = getMessageData();
            convoState.phrase = messageData.rawText;
            if (convoState.name) {
                return `${convoState.name} said "${convoState.phrase}"`;
            }
            return `You said "${convoState.phrase}"`;
        },
    },
] as Ability<UserConvoState>[];

const retainStateTestCase: TestCase<UserConvoState> = {
    description: 'Retain State in EchoBot',
    abilities: abilities,
    defaultAbility: 'echo',
    wolfStorage,
    convoStorage,
    conversationTurns: [
        {
            input: {
                message: 'hello to the world as a phrase',
                entities: [], // [{ name: 'phrase', text: 'hello to the world as a phrase', value: 'hello to the world as a phrase' }],
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
                entities: [], // [{ name: 'firstName', text: 'dave', value: 'dave' }],
                intent: null, // 'greet'
            },
            expected: {
                message: ['hi dave!'], //, 'Ok! lets go to the next step.', 'what did you say?'],
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
