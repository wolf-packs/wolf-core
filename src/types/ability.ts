import { ConvoState, MessageData, SlotData, SlotStatus, AbilityStatus, ValidateResult } from './state'
// import { SetSlotDataObj } from './function'

/**
 * Defines conversation abilities, used to control overall flow
 * that Wolf references.
 * 
 * See `example/` directory for ability examples for how to use.
 */
export interface Ability {
  name: string,
  slots: Slot[],
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
  onComplete: (convoState: ConvoState, submittedData: any) => Promise<string|void> | string | void
}

/**
 * Wolf primitive representing data points that should be collected.
 */
export interface Slot {
  name: string,
  isRequired?: boolean,
  defaultIsEnabled?: boolean,
  order?: number,
  query: (convoState: ConvoState) => string,
  validate: (submittedValue: any) => ValidateResult,
  retry: (convoState: ConvoState, submittedData: any, turnCount: number) => string,
  onFill: (
    submittedValue: any,
    convoState: ConvoState,
    setOtherSlotFunctions: SetSlotDataObj,
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
