interface Slot {
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

interface Ability {
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

interface ShouldRunCompleteResult {
  shouldComplete: boolean,
  reason?: string,
  nextAbility?: string
}

interface SetSlotDataObj {
  setSlotValue: (abilityName: string, slotName: string, value: any, runOnFill?: boolean) => void,
  setSlotEnabled: (abilityName: string, slotName: string, isEnabled: boolean) => void
}

interface ConvoState {
  [key: string]: any
}

interface WolfState {
  messageData: MessageData,
  slotStatus: SlotStatus[],
  slotData: SlotData[],
  abilityStatus: AbilityStatus[]
}

interface MessageData {
  rawText: string,
  intent: string | null,
  entities: Entity[]
}

interface SlotStatus {
  abilityName: string,
  slotName: string,
  isEnabled: boolean
}

interface SlotData {
  abilityName: string,
  slotName: string,
  value: any
}

interface AbilityStatus {
  abilityName: string,
  isCompleted: boolean
}

interface Entity {
  // TODO
}

interface ValidateResult {
  isValid: boolean,
  reason: string | null
}