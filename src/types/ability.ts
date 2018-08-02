import { ConvoState, MessageData, SlotData, SlotStatus, AbilityStatus, ValidateResult, WolfState } from './state'
import { SetSlotDataFunctions, GetSlotDataFunctions, GetStateFunctions } from './function'

/**
 * Defines conversation abilities, used to control overall flow
 * that Wolf references.
 * 
 * See `example/` directory for ability examples for how to use.
 */
export interface Ability {
  name: string,
  slots: Slot[],
  nextAbility?: (convoState: ConvoState, wolfState: WolfState) => string,
  shouldCancelAbility?: (
    convoState: ConvoState,
    messageData: MessageData
  ) => boolean,
  onCancel?: (
    convoState: ConvoState,
    slotData: SlotData[]
  ) => Promise<string|void> | string | void,
  shouldRunComplete?: (
    convoState: ConvoState,
    stateDerivedObj: {
      slotStatus: SlotStatus[],
      slotData: SlotData[],
      abilityStatus: AbilityStatus[]
    }
  ) => ShouldRunCompleteResult,
  onComplete: (convoState: ConvoState, submittedData: any, getStateFunctions: GetStateFunctions) => Promise<string|void> | string | void
}

/**
 * Wolf primitive representing data points that should be collected.
 */
export interface Slot {
  name: string,
  isRequired?: boolean,
  defaultIsEnabled?: boolean,
  order?: number,
  query: (convoState: ConvoState, getSlotDataFunctions: GetSlotDataFunctions) => string,
  validate: (submittedValue: any, messageData: MessageData) => ValidateResult,
  retry: (convoState: ConvoState, submittedData: any, turnCount: number) => string,
  onFill: (
    submittedValue: any,
    convoState: ConvoState,
    setOtherSlotFunctions: SetSlotDataFunctions,
    confirmationFunctions: ConfirmationFunctions
  ) => string | void
}

export interface ConfirmationFunctions {
  requireConfirmation: (slotName: string) => boolean,
  accept: () => void,
  deny: () => void
}

export interface ShouldRunCompleteResult {
  shouldComplete: boolean,
  reason?: string,
  nextAbility?: string
}
