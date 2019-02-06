import { Slot, Ability, SlotId } from '../types'

export const findSlotByEntityName =
  <T>(slotName: string, slots: Slot<T>[]) => slots.find((slot) => slot.name === slotName)
export const findAbilityByName =
  <T>(abilityName: string, abilities: Ability<T>[]) => abilities.find(ability => ability.name === abilityName)
export const findSlotInAbilitiesBySlotId =
  <T>(abilities: Ability<T>[], slotId: SlotId): Slot<T> | undefined => {
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
