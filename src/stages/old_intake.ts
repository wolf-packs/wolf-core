import { PendingWolfState, WolfState, WaitingSlotData } from '../types'

export interface IntakeResult extends PendingWolfState {
}

export interface NlpEntity {
  value: string,
  string: string,
  name: string
}

export interface NlpResult {
  entities: NlpEntity[],
  intent: string | undefined
}

function getActiveAbility(
  defaultAbility: string,
  activeAbility: string | null,
  intent: string | undefined
): string {
  if (activeAbility) {
    return activeAbility
  }
  if (intent) {
    return intent
  }
  return defaultAbility
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
  
  let waitingSlotData: WaitingSlotData = { intent: undefined, entities: [] }
  if (pendingWolfState.isWaitingSlot) { // bot asked for a question.. waiting for specific slot
    waitingSlotData = {
      intent: pendingWolfState.activeAbility,
      entities: [
        {
          name: pendingWolfState.waitingSlot.slotName as string,
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
    { 
      activeAbility: newActiveAbility,
      abilityCompleted: false,
      waitingSlotData
    } 
  )
  
  return pendingWithNewActiveAbility
}
