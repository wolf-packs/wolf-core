import { PendingWolfState, MessageType, Ability, AbilityFunction, Slot, AbilityFunctionMap } from '../../types'
import { EvaluateResult } from '../evaluate'
import { BotStateManager } from 'botbuilder'
const get = require('lodash.get')
const set = require('lodash.set')

export interface ActionResult extends PendingWolfState {

}

interface getStateFunctionGeneric {
  (): any
}

interface getStateFunctions {
  getBotState: getStateFunctionGeneric,
  getSgState?: getStateFunctionGeneric,
  getSubmittedData: getStateFunctionGeneric
}

export default function action(
  abilityList: Ability[],
  abilityFunctions: AbilityFunctionMap,
  state: BotState,
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
    
    const ackObj: getStateFunctions = {
      getBotState: () => state,  // user defined
      getSubmittedData: () => data
    }

    if (userAction.props && userAction.props.name) {
      const prev = get(state.conversation, userAction.props.name)
      set(state.conversation, userAction.props.name, userAction.submit(prev, data))
      ackObj.getSgState = () => get(state.conversation, userAction.props.name)
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