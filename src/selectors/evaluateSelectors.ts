import { WolfState, SlotId, PromptSlot, SlotStatus, SlotData } from '../types'

export const getAbilitiesCompleteOnCurrentTurn = (state: WolfState): string[] => {
  return state.abilitiesCompleteOnCurrentTurn
}

export const getfilledSlotsOnCurrentTurn = (state: WolfState): SlotId[] => {
  return state.filledSlotsOnCurrentTurn
}

export const getPromptedSlotStack = (state: WolfState): PromptSlot[] => {
  return state.promptedSlotStack
}

export const getFocusedAbility = (state: WolfState): string | null => {
  return state.focusedAbility
}

export const getDefaultAbility = (state: WolfState): string | null => {
  return state.defaultAbility
}

export const getSlotStatus = (state: WolfState): SlotStatus[] => {
  return state.slotStatus
}

export const getSlotData = (state: WolfState): SlotData[] => {
  return state.slotData
}
