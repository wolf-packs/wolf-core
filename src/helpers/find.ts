import { SlotId } from '../types'

export const findIndexOfSlotIdsBySlotId =
  (array: SlotId[], slotId: SlotId): number => array.findIndex((arrId) => {
    return arrId.abilityName === slotId.abilityName && arrId.slotName === slotId.slotName
  })

/**
 * The function finds a generic item <T> which extends the SlotId 
 * interface (an object that has `abilityName` and `slotName`) and returns that item
 * 
 * @param array the array of generic item <T> to search through
 * @param slotId utilize `abilityName` and `slotName` combination to search array
 * @returns generic SlotId object
 */
export const findInSlotIdItemBySlotId =
  <T extends SlotId>(array: T[], slotId: SlotId): T => array.find(arrSlotId => {
    return arrSlotId.abilityName === slotId.abilityName && arrSlotId.slotName === slotId.slotName
  }) as T
