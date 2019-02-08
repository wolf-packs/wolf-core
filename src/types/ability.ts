import { MessageData, ValidateResult, WolfState } from './state'
import { SetSlotDataFunctions, GetSlotDataFunctions, GetStateFunctions, SlotConfirmationFunctions } from './function'

/**
 * Defines conversation abilities, used to control overall flow
 * that Wolf references.
 * 
 * See `example/` directory for ability examples for how to use.
 */
export interface Ability<T> {
  name: string,
  slots: Slot<T>[],
  nextAbility?: (convoState: T, wolfState: WolfState) => NextAbilityResult,
  onComplete: (convoState: T, submittedData: any, getStateFunctions: GetStateFunctions<T>) =>
    Promise<string | void> | string | void
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
export interface Slot<T> {
  name: string,
  defaultIsEnabled?: boolean,
  order?: number,
  query: (convoState: T, getSlotDataFunctions: GetSlotDataFunctions) => string,
  validate: (submittedValue: any, messageData: MessageData) => ValidateResult,
  retry: (convoState: T, submittedData: any, turnCount: number) => string,
  onFill: (
    submittedValue: any,
    convoState: T,
    setOtherSlotFunctions: SetSlotDataFunctions,
    confirmationFunctions: SlotConfirmationFunctions
  ) => string | void
}

export interface ShouldRunCompleteResult {
  shouldComplete: boolean,
  reason?: string,
  nextAbility?: string
}

export interface IncomingSlotData {
  slotName: string,
  abilityName: string,
  value: string
}
