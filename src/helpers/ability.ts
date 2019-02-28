import { Ability, Slot } from '../types'
import { getSlotByName } from './slot'

/**
 * Given an ability, test if there are slots associated (one or more).
 * 
 * @ability Ability which will be tested
 * @returns does the ability one or more slots associated
 */
export const doesAbilityHaveSlots = <T, G>(ability: Ability<T, G>): boolean => {
  // Ability traces represent an ability:slot connection
  return (ability.traces.length !== 0)
}

/**
 * Given an array of slots, return a subset of the slots that are associated with the specific ability.
 * 
 * @param slots array of slots to search through
 * @param ability the ability to find corresponding slots by
 * @returns array of slots that correspond to the ability
 */
export const getAbilitySlots = <T, G>(slots: Slot<G>[], ability: Ability<T, G>): Slot<G>[] => {
  return ability.traces.map(trace => getSlotByName(slots, trace.slotName))
}
