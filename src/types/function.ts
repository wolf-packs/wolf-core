import { SlotStatus, SlotData } from './state';
import { Ability } from './ability';

/**
 * The object passed to onFill to allow slots
 */
export interface SetSlotDataFunctions {
  setSlotValue: (abilityName: string, slotName: string, value: any, runOnFill?: boolean) => void,
  setSlotEnabled: (abilityName: string, slotName: string, isEnabled: boolean) => void,
  setSlotDone: (abilityName: string, slotName: string, isDone: boolean) => void,
}

export interface GetSlotDataFunctions {
  getSlotValue: (slotName: string) => SlotData | undefined,
  getSlotStatus: (slotName: string) => SlotStatus | undefined
}

export interface SlotConfirmationFunctions {
  requireConfirmation: (slotName: string) => void
  accept: () => void
  deny: () => void
}

export interface GetStateFunctions {
  getAbilityList: () => Ability[]
}
