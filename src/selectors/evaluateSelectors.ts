import { WolfState, SlotId, PromptSlot, SlotStatus, SlotData } from '../types'

export const getAbilitiesCompleteOnCurrentTurn = (state: WolfState): string[] => {
  return state.abilitiesCompleteOnCurrentTurn
}

export const getFilledSlotsOnCurrentTurn = (state: WolfState): SlotId[] => {
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

export const getUnfilledEnabledSlots = (state: WolfState, focusedAbility: string): SlotId[] => {
  const slotStatus = state.slotStatus
  const slotStatusInFocusedAbility = slotStatus.filter(_ => _.abilityName === focusedAbility)
  return slotStatusInFocusedAbility
    .filter(_ => _.isEnabled)
    .filter(_ => !_.isDone)
    .map(({ slotName, abilityName }) => ({
      slotName,
      abilityName
    }))
}