/**
 * The object passed to onFill to allow slots
 */
export interface SetSlotDataObj {
  setSlotValue: (abilityName: string, slotName: string, value: any, runOnFill?: boolean) => void,
  setSlotEnabled: (abilityName: string, slotName: string, isEnabled: boolean) => void
}
