import { Ability, SlotId, Trace } from '../types';

/**
 * Given a `slotId`, return the trace object associated with the `abilityName` and `slotName`
 * 
 * @param abilities array of abilities to search through for the trace object
 * @param slotId object that supplies the `slotName` and `abilityName` used to search for the trace object
 * @returns trace object
 */
export const getTraceBySlotId = <T, G>(abilities: Ability<T, G>[], slotId: SlotId): Trace<G> => {
  // TODO: Update when merging development branch to utilize `getAbilityByName`
  const ability = abilities.find(_ => _.name === slotId.abilityName)
  if (!ability) {
    throw new Error(`Cannot find trace object. There is no ability called ${slotId.abilityName}.`)
  }
  
  const trace = ability.traces.find(_ => _.slotName === slotId.slotName)
  if (!trace) {
    throw new Error(`Cannot find trace object. There is no slot called ${slotId.slotName} in the ${slotId.abilityName} ability`)
  }
  
  return trace
}
