import { Slot, Ability, SlotId, StorageLayer } from '../types'

export const findSlotByEntityName =
  <G>(slotName: string, slots: Slot<G>[]) => slots.find((slot) => slot.name === slotName)
export const findAbilityByName =
  <T, G>(abilityName: string, abilities: Ability<T, G>[]) => abilities.find(ability => ability.name === abilityName)
export const findSlotInAbilitiesBySlotId =
  <T, G>(abilities: Ability<T, G>[], slotId: SlotId): Slot<G> | undefined => {
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
