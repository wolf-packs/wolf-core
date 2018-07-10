import { PendingWolfState, Ability, AbilityFunctionMap, Slot } from '../types'
import { FillSlotsResult } from './fillSlot'
const get = require('lodash.get')
const difference = require('lodash.difference')

export interface EvaluateResult {
  pendingWolfState: PendingWolfState,
  type: string,
  name: string,
}

const getPendingData = ( pendingWolfState: PendingWolfState ): Object => {
  if ( !pendingWolfState.abilityCompleted ) {
    return get(pendingWolfState.pendingData, pendingWolfState.activeAbility, {})
  }
  return {}
}

export default function evaluate(
  abilityDataDef: Ability[],
  abilityFunctions: AbilityFunctionMap,
  result: FillSlotsResult
): EvaluateResult {
  // simplest non-graph implementation
  const pendingWolfState = result
  const { activeAbility, abilityCompleted, pendingData } = pendingWolfState
  const abilityObj = abilityDataDef.find((ability) => ability.name === activeAbility)
  if (!abilityObj) {
    throw new Error(`Cannot find the ability named: ${abilityObj}. 
    Please make sure your default Ability is spelled right`)
  }
  const currentPendingData = getPendingData(pendingWolfState)
  const missingSlots = difference(abilityObj.slots.map(slot => slot.name), Object.keys(currentPendingData))
  if (missingSlots.length === 0) { // no missingSlot
    return {
      pendingWolfState,
      type: 'userAction',
      name: activeAbility
    }
  }

  const { slots } = abilityObj
  const pendingSlot = slots.find(slot => slot.name === missingSlots[0]) as Slot
  return {
    pendingWolfState,
    type: 'slot',
    name: pendingSlot.name
  }
}