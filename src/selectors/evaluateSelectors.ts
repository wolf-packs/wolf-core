import { WolfState, SlotId, PromptSlot } from '../types'

export const getAbilityCompleteOnCurrentTurn = (state: WolfState): string | null => {
  return state.abilityCompleteOnCurrentTurn
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
