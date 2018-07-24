import { WolfState, SlotData } from '../types'

export const getSlotDataByAbilityName = (state: WolfState, abilityName: string): SlotData[] => { // TODO (Done)
  return state.slotData.filter((slot) => slot.abilityName === abilityName)
}
