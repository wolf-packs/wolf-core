import { ConvoState, MessageData, ValidateResult, WolfState } from './state'
import { SetSlotDataFunctions, GetSlotDataFunctions, GetStateFunctions, SlotConfirmationFunctions } from './function'

/**
 * Defines conversation abilities, used to control overall flow
 * that Wolf references.
 * 
 * See `example/` directory for ability examples for how to use.
 */
export interface Ability {
  name: string,
  slots: Slot[],
  nextAbility?: (convoState: ConvoState, wolfState: WolfState) => NextAbilityResult,
  onComplete: (convoState: ConvoState, submittedData: any, getStateFunctions: GetStateFunctions) => Promise<string|void> | string | void
}

/**
 * result of the nextAbility function
 */
export interface NextAbilityResult {
  abilityName: string,
  message: string | null
}

/**
 * Wolf primitive representing data points that should be collected.
 */
export interface Slot {
  name: string,
  defaultIsEnabled?: boolean,
  order?: number,
  query: (convoState: ConvoState, getSlotDataFunctions: GetSlotDataFunctions) => string,
  validate: (submittedValue: any, messageData: MessageData) => ValidateResult,
  retry: (convoState: ConvoState, submittedData: any, turnCount: number) => string,
  onFill: (
    submittedValue: any,
    convoState: ConvoState,
    setOtherSlotFunctions: SetSlotDataFunctions,
    confirmationFunctions: SlotConfirmationFunctions
  ) => string | void
}

export interface ShouldRunCompleteResult {
  shouldComplete: boolean,
  reason?: string,
  nextAbility?: string
}
