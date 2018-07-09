export interface WaitingFor {
  slotName: string | null,
  turnCount: number, // initial = 0
}

export enum MessageType {
  validateReason,
  retryMessage,
  queryMessage,
  slotFillMessage,
  abilityMessage
}

export interface MessageQueueItem {
  message: string | null,
  type: MessageType,
  slotName?: string,
  abilityName?: string
}

export interface WolfState {
  activeAbility: string,
  abilityCompleted: boolean,
  waitingFor: WaitingFor,
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
  query: string,
  type: string,
  retry?: (turnCount: number) => string,
  validate?: (value: string) => SlotValidation,
  acknowledge?: (value: any) => string
}

export interface Ability {
  name: string,
  slots: Slot[]
}

export interface AbilityFunction {
  props: {
    name: string
  },
  submit: <T>(prev: T|T[], value: any) => T|T[],
  acknowledge: (funcs: any) => string
}

export interface AbilityFunctionMap {
  [key: string]: AbilityFunction
}