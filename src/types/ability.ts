import { WolfState } from './state'
import { GetStateFunctions } from './function'
import { Slot } from './slot';

/**
 * Defines conversation abilities, used to control overall ability slots and completion task
 * 
 * See `example/` directory for ability examples for how to use.
 */
export interface Ability<T> {
  name: string,
  slots: Slot<T>[],
  nextAbility?: (convoState: T, wolfState: WolfState) => NextAbilityResult,
  onComplete: (convoState: T, submittedData: any, getStateFunctions: GetStateFunctions<T>) =>
    Promise<string | void> | string | void
}

/**
 * Object interface for the output of the `nextAbility` function
 */
export interface NextAbilityResult {
  abilityName: string,
  message?: string | null
}
