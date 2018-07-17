import { 
  PendingWolfState,
  MessageType, 
  Ability, 
  ConvoState, 
  GetIncompleteAbilityStateFunctions,
  GetCompletedAbilityStateFunctions
} from '../types'
import { EvaluateResult } from './evaluate'
import { addMessageToQueue } from '../helpers';
const get = require('lodash.get')
const set = require('lodash.set')

export interface ActionResult {
  pendingWolfState: PendingWolfState,
  runOnComplete: () => Promise<string | null>
}

const runSlotAction = (
  evaluateResult: EvaluateResult, 
  pendingWolfState: PendingWolfState, 
  abilityList: Ability[],
  convoState: ConvoState  
): ActionResult => {
  // Next action: gather information to fill slot (determined by eval stage)

    // Load slots baseed on ability
    const activeAbility = abilityList.find((ability) => ability.name === pendingWolfState.activeAbility) as Ability
    const slots = activeAbility.slots
    // Select slot defined by evaluate result
    const slot = slots.find((slot) => slot.name === evaluateResult.name)

    // Safety null check - eval stage should catch
    if (!slot) {
      // No pending slot found based on result.name
      return {
        pendingWolfState: pendingWolfState,
        runOnComplete: () => Promise.resolve('Please makesure that your slot name is spelled correctly')
      }
    }
    
    // Not currently waiting for a response to a prompt
    if (!pendingWolfState.waitingFor.slotName) {
      // Change into a waiting state (slot prompt will be added to queue)
      pendingWolfState.waitingFor = {
        slotName: slot.name,
        turnCount: 0
      }

      const stateFunctions: GetIncompleteAbilityStateFunctions = {
        getConvoState: () => convoState,
        getPendingWolfState: () => pendingWolfState,
        getAbilityList: () => abilityList   
      }                  
      
      // Add slot prompt onto messageQueue to prompt user
      const updatedPendingWolfState = addMessageToQueue(
        pendingWolfState,
        slot.query(stateFunctions),
        MessageType.queryMessage,
        slot.name
      )
      return { pendingWolfState: updatedPendingWolfState, runOnComplete: () => Promise.resolve(null) }
    }
    return { pendingWolfState: pendingWolfState, runOnComplete: () => Promise.resolve(null) }
}

const runUserAction = (
  evaluateResult: EvaluateResult, 
  pendingWolfState: PendingWolfState, 
  abilityList: Ability[],
  convoState: ConvoState
): ActionResult => {
  const ability = abilityList.find((ability) => ability.name === evaluateResult.name) as Ability
  const data = pendingWolfState.pendingData[ability.name]
  
  const stateFunctions: GetCompletedAbilityStateFunctions = {
    getSubmittedData: () => data,
    getConvoState: () => convoState,
    getPendingWolfState: () => pendingWolfState,
    getAbilityList: () => abilityList
  }
  
  // remove pendingData
  pendingWolfState.abilityCompleted = true
  pendingWolfState.pendingData[ability.name] = undefined
  pendingWolfState.activeAbility = ''

  const runOnComplete = () => {
    if (!ability.onComplete) {
      return Promise.resolve(null)
    }

    const valueOrPromise = ability.onComplete(stateFunctions)
    
    if (valueOrPromise === null) {
      return Promise.resolve(valueOrPromise)
    }

    if (typeof valueOrPromise === 'string') {
      return Promise.resolve(valueOrPromise)
    }

    if (typeof valueOrPromise.then === 'function') {
      return valueOrPromise
    }

    return Promise.resolve(valueOrPromise)
  }
  
  return { pendingWolfState: pendingWolfState, runOnComplete }  
}

export default function action(
  abilityList: Ability[],
  convoState: ConvoState,
  result: EvaluateResult
): ActionResult {
  const { pendingWolfState } = result
  if (result.type === 'slot') {
    return runSlotAction(result, pendingWolfState, abilityList, convoState)
  }
  
  if (result.type === 'userAction') {
    return runUserAction(
      result, pendingWolfState, abilityList, convoState)                    
  }
  return { pendingWolfState: pendingWolfState, runOnComplete: () => Promise.resolve(null) }
}
