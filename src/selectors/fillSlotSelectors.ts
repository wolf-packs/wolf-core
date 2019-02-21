import {
  WolfState, PromptSlot, SlotId, Ability, Slot, SlotStatus,
  MessageData, OnFillStackItem, StorageLayer
} from '../types'
import { findIndexOfSlotIdsBySlotId } from '../helpers'

// export const getSlotAbilityName = (state: WolfState): string => state. 

export const getPromptedSlotId = (state: WolfState): SlotId => state.promptedSlotStack[0]

export const getSlotBySlotId = <T, G>(abilities: Ability<T, G>[], slotInfo: SlotId): Slot<G> | undefined => {
  const ability = abilities.find((ability: Ability<T, G>) => ability.name === slotInfo.abilityName)
  if (!ability) {
    return
  }
  const foundSlot = ability.slots.find((slot: Slot<G>) => slot.name === slotInfo.slotName)
  return foundSlot
}

export const isPromptStatus = (state: WolfState) => {
  return state.promptedSlotStack[0] ? state.promptedSlotStack[0].prompted : false
}

export const isFocusedAbilitySet = (state: WolfState) => state.focusedAbility

export const getSlotTurnCount = (state: WolfState, slotId: SlotId): number => {
  const promptSlot = state.promptedSlotStack.find((promptSlot: PromptSlot) =>
    promptSlot.slotName === slotId.slotName && promptSlot.abilityName === slotId.abilityName
  )
  if (promptSlot) {
    return promptSlot.turnCount
  }
  return 0
}

export const getTargetAbility = <T, G>(abilities: Ability<T, G>[], targetAbility: string): Ability<T, G> | undefined => {
  return abilities.find((ability) => ability.name === targetAbility)
}

export const getRequestingSlotIdFromCurrentSlotId = (state: WolfState, slotId: SlotId): SlotId => {
  const slotIndex = findIndexOfSlotIdsBySlotId(state.slotStatus, slotId)
  const slot: SlotStatus = state.slotStatus[slotIndex]
  if (!slot.requestingSlot) {
    throw new Error(`You did not request any slot to use this slot to confirm`)
  }
  return {
    abilityName: slot.abilityName,
    slotName: slot.requestingSlot
  }
}

export const getMessageData = (state: WolfState): MessageData => state.messageData

export const getRunOnFillStack = (state: WolfState): OnFillStackItem[] => state.runOnFillStack
