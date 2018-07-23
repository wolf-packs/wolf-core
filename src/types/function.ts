/**
 * The object passed to onFill to allow slots
 */
export interface SetSlotDataFunctions {
  setSlotValue: (abilityName: string, slotName: string, value: any, runOnFill?: boolean) => void,
  setSlotEnabled: (abilityName: string, slotName: string, isEnabled: boolean) => void
}

export interface SlotConfirmationFunctions {
  requireConfirmation: (slotName: string) => void
  accept: () => void
  deny: () => void
}