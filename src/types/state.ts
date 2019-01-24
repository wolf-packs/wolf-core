import { Store, AnyAction } from 'redux';

/**
 * Conversation state managed by Botbuilder
 */
export interface ConvoState {
  [key: string]: any
}

export type WolfStore = Store<WolfState, AnyAction>;

/**
 * Wolf's state object that facilitates management of state sytem.
 * 
 * _User should not touch this object._
 */
export interface WolfState {
  messageData: MessageData,
  slotStatus: SlotStatus[],
  slotData: SlotData[],
  abilityStatus: AbilityStatus[],
  promptedSlotStack: PromptSlot[],
  focusedAbility: string | null,
  outputMessageQueue: OutputMessageItem[],
  filledSlotsOnCurrentTurn: SlotId[],
  abilitiesCompleteOnCurrentTurn: string[],
  defaultAbility: string | null,
  runOnFillStack: OnFillStackItem[]
}

export interface PromptSlot extends SlotId {
  turnCount: number,
  reasonAdded: PromptSlotReason,
  prompted: boolean
}

export enum PromptSlotReason {
  query,
  retry,
  confirmation
}

export interface SlotId {
  slotName: string,
  abilityName: string
}

export interface MessageData {
  rawText: string,
  intent: string | null,
  entities: Entity[]
}

export interface OutputMessageItem {
  message: string,
  type: OutputMessageType,
  slotName?: string,
  abilityName?: string
}

export enum OutputMessageType {
  validateReason,
  retryMessage,
  queryMessage,
  slotFillMessage,
  nextAbilityMessage,
  abilityCompleteMessage
}

export interface SlotStatus extends SlotId {
  isEnabled: boolean,
  requestingSlot?: string,
  confirmationSlot?: string,
  isDone: boolean
}

export interface SlotData extends SlotId {
  isConfirmed?: boolean,
  value: any
}

export interface AbilityStatus {
  abilityName: string,
  isCompleted: boolean
}

export interface ValidateResult {
  isValid: boolean,
  reason: string | null
}

export interface NlpResult {
  message: string,
  intent: string | null,
  entities: NlpEntity[]
}

export interface NlpEntity {
  value: any,  // normalized value
  text: string,   // raw value
  name: string    // entity name
}

export interface Entity extends NlpEntity {

}

export interface OnFillStackItem extends SlotId {
  value?: any,
  message: string
}