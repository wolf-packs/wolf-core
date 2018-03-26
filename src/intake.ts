import { PendingWolfState } from './types'

export interface IntakeResult {
  pendingWolfState: PendingWolfState,
  nlpResult: NlpResult
}

export interface Entity {
  value: string,
  string: string,
  entity: string
}

export interface NlpResult {
  entities: Entity[],
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
  wolfState: PendingWolfState,
  nlpResult: NlpResult,
  defaultAbility: string
): IntakeResult {
  const pendingWolfState = Object.assign({}, wolfState)
  const prevActiveAbility = pendingWolfState.activeAbility
  
  const newActiveAbility = getActiveAbility(defaultAbility, prevActiveAbility, nlpResult.intent)
  const pendingWithNewActiveAbility = Object.assign(
    {},
    pendingWolfState,
    {activeAbility: newActiveAbility, abilityCompleted: false}
  )
  
  return {
    pendingWolfState: pendingWithNewActiveAbility,
    nlpResult
  }
}