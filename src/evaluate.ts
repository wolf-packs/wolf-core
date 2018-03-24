import { PendingWolfState, Ability, AbilityFunction, Slot } from './types'
import { FillSlotsResult } from './fillSlot'

const difference = require('lodash.difference')

export interface EvaluateResult {
  pendingWolfState: PendingWolfState,
  type: string,
  name: string,
}

export default function evaluate(abilityDataDef: Ability[], abilityFunctions: AbilityFunction, result: FillSlotsResult): EvaluateResult {
  // simplest non-graph implementation
  const pendingWolfState = result
  const { activeAbility, abilityCompleted, pendingData } = pendingWolfState
  const abilityObj = abilityDataDef.find((ability) => ability.name === activeAbility)
  if (!abilityObj) {
    throw new Error(`Cannot find the ability named: ${abilityObj}. Please make sure your default Ability is spelled right`)
  }
  const currentPendingData = !abilityCompleted ? pendingData[activeAbility] : {}
  const missingSlots = difference(abilityObj.slots.map(slot => slot.entity), Object.keys(currentPendingData))
  if (missingSlots.length === 0) { // no missingSlot
    return {
      pendingWolfState,
      type: 'userAction',
      name: activeAbility
    }
  }

  const { slots } = abilityObj
  const pendingSlot = slots.find(slot => slot.entity === missingSlots[0]) as Slot
  return {
    pendingWolfState,
    type: 'slot',
    name: pendingSlot.entity
  }
}