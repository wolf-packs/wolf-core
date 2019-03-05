import { Ability, SlotId, Trace } from '../types';
import { getAbilityByName } from './ability';

/**
 * Given a `slotId`, return the trace object associated with the `abilityName` and `slotName`
 * 
 * @param abilities array of abilities to search through for the trace object
 * @param slotId object that supplies the `slotName` and `abilityName` used to search for the trace object
 * @returns trace object
 */
export const getTraceBySlotId = <T, G>(abilities: Ability<T, G>[], slotId: SlotId): Trace<G> => {
  const ability = getAbilityByName(abilities, slotId.abilityName)

  const trace = ability.traces.find(_ => _.slotName === slotId.slotName)
  if (!trace) {
    throw new Error(`Cannot find trace object. There is no slot called ${slotId.slotName} in the ${slotId.abilityName} ability`)
  }

  return trace
}
