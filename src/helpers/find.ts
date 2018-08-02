import { Slot, Ability, SlotId } from '../types'

export const findSlotByEntityName = 
  (slotName: string, slots: Slot[]) => slots.find((slot) => slot.name === slotName)
export const findAbilityByName = 
  (abilityName: string, abilities: Ability[]) => abilities.find(ability => ability.name === abilityName)
export const findSlotInAbilitiesBySlotId =
  (abilities: Ability[], slotId: SlotId): Slot | undefined => {
    const ability = abilities.find(ability => ability.name === slotId.abilityName)
    if (!ability) {
      return
    }
    const slot = ability.slots.find(slot => slot.name === slotId.slotName)
    return slot
  }
export const findIndexOfSlotIdsBySlotId = 
  (array: SlotId[], slotId: SlotId): number => array.findIndex((arrId) => {
    return arrId.abilityName === slotId.abilityName && arrId.slotName === slotId.slotName
  })
export const findInSlotIdItemBySlotId = 
  <T extends SlotId>(array: T[], slotId: SlotId): T => array.find(arrSlotId => {
    return arrSlotId.abilityName === slotId.abilityName && arrSlotId.slotName === slotId.slotName
  }) as T
