import { NlpResult } from '../stages/old_intake';

export interface WaitingSlot {
  slotName: string | null,
  turnCount: number, // initial = 0
}

export interface WaitingSlotData extends NlpResult {
}

export enum ActionType {
  slot,
  ability
}

export enum MessageType {
  validateReason,
  retryMessage,
  queryMessage,
  slotFillMessage,
  abilityCompleteMessage
}

export interface MessageQueueItem {
  message: string | null,
  type: MessageType,
  slotName?: string,
  abilityName?: string
}

export interface ConvoState {
  [key: string]: any
}

export interface WolfState {
  activeAbility: string,
  abilityCompleted: boolean,
  isWaitingSlot: boolean,
  waitingSlot: WaitingSlot,
  waitingSlotData: WaitingSlotData,
  messageQueue: MessageQueueItem[],
  pendingData: {
    [key: string]: any
  }
}

export interface PendingWolfState extends WolfState {

}

export interface SlotValidation {
  valid: boolean,
  reason?: string
}

export interface Slot {
  name: string,
  query: (stateFunctions: GetIncompleteAbilityStateFunctions) => string,
  type: string,
  retry?: (turnCount: number) => string,
  validate?: (value: string) => SlotValidation,
  onFill?: (value: any) => string
}

export interface Ability {
  name: string,
  slots: Slot[]
  onComplete?: (stateFuncs: GetCompletedAbilityStateFunctions) => Promise<string|null> | string | null
}

interface GetStateFunctionGeneric {
  (): any
}

export interface GetStateFunctions {
  getSubmittedData?: GetStateFunctionGeneric,
  getConvoState: GetStateFunctionGeneric,
  getPendingWolfState?: GetStateFunctionGeneric,
  getAbilityList?: GetStateFunctionGeneric
}

export interface GetCompletedAbilityStateFunctions {
  getSubmittedData: <S>() => S,
  getConvoState: () => ConvoState,
  getPendingWolfState: () => PendingWolfState,
  getAbilityList: () => Ability[]
}

export interface GetIncompleteAbilityStateFunctions {
  getConvoState: () => ConvoState,
  getPendingWolfState: () => PendingWolfState,
  getAbilityList: () => Ability[]
}