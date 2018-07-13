import { Slot, Ability } from '../types'

export const findSlotByEntityName = 
  (slotName: string, slots: Slot[]) => slots.find((slot) => slot.name === slotName)
export const findAbilityByName = 
  (abilityName: string, abilities: Ability[]) => abilities.find(ability => ability.name === abilityName)
