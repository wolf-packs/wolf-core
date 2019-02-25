import { WolfState } from './state'
import { GetStateFunctions } from './function'
import { Slot } from './slot';
import { StorageLayer } from './storage';

/**
 * Defines conversation abilities, used to control overall ability slots and completion task
 * 
 * See `example/` directory for ability examples for how to use.
 */
export interface Ability<T, G> {
  name: string,
  slots: Slot<G>[],
  nextAbility?: (convoStorageLayer: G, wolfState: WolfState) => NextAbilityResult,
  onComplete: (submittedData: any, convoStorageLayer: G, getStateFunctions: GetStateFunctions<T, G>) =>
    Promise<string | void> | string | void
}

/**
 * Object interface for the output of the `nextAbility` function
 */
export interface NextAbilityResult {
  abilityName: string,
  message?: string | null
}
