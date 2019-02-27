import { Slot } from '../types'

/**
 * Given an array of slots and a specific slotName, return the associated slot object
 * 
 * @param slots array of slots to search
 * @param slotName name of the slot to search for
 * @returns slot with the corresponding slot name
 */
export const getSlotByName = <G>(slots: Slot<G>[], slotName: string): Slot<G> => {
  const matchingSlot = slots.find(slot => slot.name === slotName)
  if (!matchingSlot) { // Checking for undefined
    throw new Error(`No slot exists given the slot name: ${slotName}`)
  }
  return matchingSlot
}
