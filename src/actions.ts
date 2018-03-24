import { PendingWolfState, MessageType, Ability, AbilityFunction } from './types'
import { EvaluateResult } from './evaluate'
import { BotStateManager } from 'botbuilder'

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

export default function action(abilityList: Ability[], abilityFunctions: AbilityFunction, state: BotState, result: EvaluateResult): ActionResult {
  const { pendingWolfState } = result
  if (result.type === 'slot') {
    const { slots } = abilityList.find((ability) => ability.name === pendingWolfState.activeAbility)
    const slot = slots.find((slot) => slot.entity === result.name)

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
    const ability = abilityList.find((ability) => ability.name === result.name)
    const userAction = abilityFunctions[ability.name]
    const data = pendingWolfState.pendingData[ability.name]
    
    const ackObj: getStateFunctions = {
      getBotState: () => state,  // user defined
      getSubmittedData: () => data
    }

    if (userAction.props && userAction.props.name) {
      const prev = state.conversation[userAction.props.name]
      state.conversation[userAction.props.name] = userAction.submit(prev, data)
      ackObj.getSgState = () => state.conversation[userAction.props.name]
    }

    pendingWolfState.messageQueue.push({
      message: userAction.acknowledge(ackObj),
      type: MessageType.abilityMessage,
      abilityName: ability.name
    })

    // remove pendingData
    pendingWolfState.abilityCompleted = true
    pendingWolfState.pendingData[ability.name] = undefined
    return pendingWolfState
  }
  return pendingWolfState
}