import { PendingWolfState, MessageType, Ability, AbilityFunction, Slot, AbilityFunctionMap } from '../../types'
import { EvaluateResult } from '../evaluate'
import { ConversationState } from 'botbuilder'
const get = require('lodash.get')
const set = require('lodash.set')

export interface ActionResult extends PendingWolfState {

}

interface GetStateFunctionGeneric {
  (): any
}

interface GetStateFunctions {
  getConversationState: GetStateFunctionGeneric,
  getSgState?: GetStateFunctionGeneric,
  getSubmittedData: GetStateFunctionGeneric
}

export default function action(
  abilityList: Ability[],
  abilityFunctions: AbilityFunctionMap,
  convoState: Object,
  result: EvaluateResult
): ActionResult {
  const { pendingWolfState } = result
  if (result.type === 'slot') {
    const { slots } = abilityList.find((ability) => ability.name === pendingWolfState.activeAbility) as Ability
    const slot = slots.find((slot) => slot.entity === result.name)

    if (!slot) {
      return pendingWolfState
    }

    if (!pendingWolfState.waitingFor.slotName) {
      pendingWolfState.waitingFor = {
        slotName: slot.entity,
        turnCount: 0
      }
      pendingWolfState.messageQueue.push({
        message: slot.query,
        type: MessageType.queryMessage,
        slotName: slot.entity
      })
    }
    return pendingWolfState
  }
  
  if (result.type === 'userAction') {
    const ability = abilityList.find((ability) => ability.name === result.name) as Ability
    const userAction = abilityFunctions[ability.name]
    const data = pendingWolfState.pendingData[ability.name]
    
    const ackObj: GetStateFunctions = {
      getConversationState: () => convoState,  // user defined
      getSubmittedData: () => data
    }

    if (userAction.props && userAction.props.name) {
      const prev = get(convoState, userAction.props.name)
      set(convoState, userAction.props.name, userAction.submit(prev, data))
      ackObj.getSgState = () => get(convoState, userAction.props.name)
    }

    pendingWolfState.messageQueue.push({
      message: userAction.acknowledge(ackObj),
      type: MessageType.abilityMessage,
      abilityName: ability.name
    })

    // remove pendingData
    pendingWolfState.abilityCompleted = true
    pendingWolfState.pendingData[ability.name] = undefined
    pendingWolfState.activeAbility = ''
    return pendingWolfState
  }
  return pendingWolfState
}