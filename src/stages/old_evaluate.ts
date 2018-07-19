import { PendingWolfState, Ability, Slot } from '../types'
import { FillSlotsResult } from './old_fillSlot'
import { ActionType } from '../types/old_types';
const get = require('lodash.get')
const difference = require('lodash.difference')

export interface EvaluateResult {
  pendingWolfState: PendingWolfState,
  type: ActionType,
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
  result: FillSlotsResult
): EvaluateResult {
  // simplest non-graph implementation
  const pendingWolfState = result
  const { activeAbility } = pendingWolfState
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
      type: ActionType.ability,
      name: activeAbility
    }
  }

  const { slots } = abilityObj
  const pendingSlot = slots.find(slot => slot.name === missingSlots[0]) as Slot
  return {
    pendingWolfState,
    type: ActionType.slot,
    name: pendingSlot.name
  }
}
