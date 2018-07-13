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

export interface ConvoState {
  [key: string]: any
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
  query: (stateFunctions: GetStateFunctions) => string,
  type: string,
  retry?: (turnCount: number) => string,
  validate?: (value: string) => SlotValidation,
  onFill?: (value: any) => string
}

export interface Ability {
  name: string,
  slots: Slot[]
  onComplete?: (stateFuncs: GetStateFunctions) => Promise<string|null> | string | null
}

// export interface AbilityFunction {
//   props: {
//     name: string
//   },
//   submit: <T>(prev: T|T[], value: any) => T|T[],
//   acknowledge: (funcs: any) => string
// }

// export interface AbilityFunctionMap {
//   [key: string]: AbilityFunction
// }

interface GetStateFunctionGeneric {
  (): any
}

export interface GetStateFunctions {
  getSubmittedData?: GetStateFunctionGeneric
  getConvoState: GetStateFunctionGeneric,
  getPendingWolfState?: GetStateFunctionGeneric,
  getAbilityList?: GetStateFunctionGeneric
}
