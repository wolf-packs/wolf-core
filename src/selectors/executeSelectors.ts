import { WolfState, SlotData, AbilityStatus } from '../types'

export const getSlotDataByAbilityName = (state: WolfState, abilityName: string): SlotData[] => {
  return state.slotData.filter((slot) => slot.abilityName === abilityName)
}

export const getAbilityStatus = (state: WolfState): AbilityStatus[] => state.abilityStatus
