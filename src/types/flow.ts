import { Ability } from './ability'
import { Slot } from './slot'

/**
 * Flow is made up of Abilities and Slots and are used to define the bot conversation flow
 */
export interface Flow<T, G> {
  slots: Slot<G>[],
  abilities: Ability<T, G>[]
}
