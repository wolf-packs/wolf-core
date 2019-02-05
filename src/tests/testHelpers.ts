import { WolfState, StorageLayer } from '../types'

export const createStorage = <T>(initial: T): StorageLayer<T> => {
  let data = initial
  return {
    read: () => data,
    save: (newData: T) => {
      data = newData
    }
  }
}

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
