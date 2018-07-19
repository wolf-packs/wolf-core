import { Entity } from '../stages/intake'

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
