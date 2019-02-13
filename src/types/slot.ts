import { GetSlotDataFunctions, SetSlotDataFunctions, SlotConfirmationFunctions } from './function';
import { MessageData, ValidateResult } from './state';

/**
 * Wolf primitive representing data points that should be collected. Any piece of information
 * in a conversation that is of interest/required to aid in the conversation flow or user
 * experience.
 * 
 * See `example/` directory for ability examples for how to use.
 */
export interface Slot<T> {
  name: string,
  defaultIsEnabled?: boolean,
  order?: number,
  query: (convoState: T, getSlotDataFunctions: GetSlotDataFunctions) => string,
  validate?: (submittedValue: any, messageData: MessageData) => ValidateResult,
  retry?: (convoState: T, submittedData: any, turnCount: number) => string,
  onFill?: (
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
