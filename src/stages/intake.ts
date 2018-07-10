import { PendingWolfState, WolfState } from '../types'

export interface IntakeResult {
  pendingWolfState: PendingWolfState,
  nlpResult: NlpResult
}

export interface NlpEntity {
  value: string,
  string: string,
  name: string
}

export interface NlpResult {
  entities: NlpEntity[],
  intent: string
}

function getActiveAbility(defaultAbility: string, activeAbility: string | undefined, intent: string | undefined)
: string {
  if (activeAbility) {
    return activeAbility
  }
  return intent ? intent : defaultAbility
}

export default function intake(
  wolfState: WolfState,
  nlpResult: NlpResult,
  userMessage: string,
  defaultAbility: string
): IntakeResult {
  // Load pendingWolfState from stored wolfState (from previous turn)
  // By updating pendingWolfState throughout stages, we can avoid mutations until last stage (to update)
  const pendingWolfState = Object.assign({}, wolfState) as PendingWolfState

  if (pendingWolfState.waitingFor.slotName) { // bot asked for a question
    nlpResult = {
      intent: pendingWolfState.activeAbility,
      entities: [
        {
          name: pendingWolfState.waitingFor.slotName,
          value: userMessage,
          string: userMessage
        }
      ]
    }
  }

  const prevActiveAbility = pendingWolfState.activeAbility
  
  const newActiveAbility = getActiveAbility(defaultAbility, prevActiveAbility, nlpResult.intent)
  const pendingWithNewActiveAbility = Object.assign(
    {},
    pendingWolfState,
    { activeAbility: newActiveAbility, abilityCompleted: false }
  )
  
  return {
    pendingWolfState: pendingWithNewActiveAbility,
    nlpResult
  }
}