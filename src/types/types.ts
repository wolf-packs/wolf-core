import { Entity } from '../stages/intake'

// Ability and Slot 
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
  onFill: (
    convoState: ConvoState,
    setOtherSlotFunctions: SetSlotDataObj,
    submittedValue: any,
  ) => string
}

export interface ShouldRunCompleteResult {
  shouldComplete: boolean,
  reason?: string,
  nextAbility?: string
}

// Get and Set Functions

export interface SetSlotDataObj {
  setSlotValue: (abilityName: string, slotName: string, value: any, runOnFill?: boolean) => void,
  setSlotEnabled: (abilityName: string, slotName: string, isEnabled: boolean) => void
}

// State

/**
 * Conversation state managed by Botbuilder
 */
export interface ConvoState {
  [key: string]: any
}

/**
 * Wolf's state object that facilitates management of state sytem.
 * 
 * _User should not touch this object._
 */
export interface WolfState {
  messageData: MessageData,
  slotStatus: SlotStatus[],
  slotData: SlotData[],
  abilityStatus: AbilityStatus[]
}

export interface MessageData {
  rawText: string,
  intent: string | null,
  entities: Entity[]
}

export interface SlotStatus {
  abilityName: string,
  slotName: string,
  isEnabled: boolean
}

export interface SlotData {
  abilityName: string,
  slotName: string,
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
