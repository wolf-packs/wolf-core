import { GetSlotDataFunctions, SetSlotDataFunctions, SlotConfirmationFunctions } from './function';
import { MessageData, ValidateResult } from './state';
import { Promiseable } from './generic';

/**
 * Wolf primitive representing data points that should be collected. Any piece of information
 * in a conversation that is of interest/required to aid in the conversation flow or user
 * experience.
 * 
 * See `example/` directory for ability examples for how to use.
 */
export interface Slot<G> {
  name: string,
  defaultIsEnabled?: boolean,
  query: (convoStorageLayer: G, getSlotDataFunctions: GetSlotDataFunctions) => Promiseable<string>,
  validate?: (submittedValue: any, convoStorageLayer: G, messageData: MessageData) => Promiseable<ValidateResult>,
  retry?: (submittedValue: any, convoStorageLayer: G, turnCount: number) => Promiseable<string>,
  onFill?: (
    submittedValue: any,
    convoStorageLayer: G,
    setOtherSlotFunctions: SetSlotDataFunctions,
    confirmationFunctions: SlotConfirmationFunctions
  ) => Promiseable<string | void>
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

export interface SlotRecord<T> {
  value: T,
  abilityName: string | null,
  slotName: string
}
