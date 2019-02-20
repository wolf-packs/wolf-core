import * as wolf from '../..'
import { WolfState, AllSyncStorageLayer, Ability } from '../../types'

export interface ConversationTurn<T> {
  input: wolf.NlpResult,
  expected: { message: string[], state: T }
}

export interface TestCase<T> {
  description: string,
  abilities: Ability<T>[],
  wolfStorage: wolf.WolfStateStorage,
  convoStorage: wolf.StorageLayer<T>,
  defaultAbility: string,
  conversationTurns: ConversationTurn<T>[]
}

export const createStorage = <T>(initial: T): StorageLayerType<T> => {
  let data = initial
  return {
    read: () => data,
    save: (newData: T) => {
      data = newData
    }
  }
}

export type StorageLayerType<T> = AllSyncStorageLayer<T>

export const getInitialWolfState = (): WolfState => {
  return {
    messageData: { entities: [], intent: null, rawText: '' },
    slotStatus: [],
    slotData: [],
    abilityStatus: [],
    promptedSlotStack: [],
    focusedAbility: null,
    outputMessageQueue: [],
    filledSlotsOnCurrentTurn: [],
    abilitiesCompleteOnCurrentTurn: [],
    defaultAbility: null,
    runOnFillStack: []
  }
}

export function runTest<T>(jestTestFn: jest.It, testCase: TestCase<T>) {
  jestTestFn(testCase.description, async () => {
    for (const turn of testCase.conversationTurns) {
      const outputResult = await wolf.run(
        testCase.wolfStorage,
        testCase.convoStorage,
        () => (turn.input),
        () => testCase.abilities,
        testCase.defaultAbility
      )

      expect(outputResult.messageStringArray).toEqual(turn.expected.message)
      expect(testCase.convoStorage.read()).toEqual(turn.expected.state)
    }
  })
}
