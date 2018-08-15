import { SlotId } from '../types'

export const changeArrayItemOnIndex = (arr: any[], index: number, item: any) => {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)]
}

export const removeSlotFromSlotIdArray = <T extends SlotId>(arr: T[], slotId: SlotId): T[] => {
  return arr.filter(_ => !(_.abilityName === slotId.abilityName && _.slotName === slotId.slotName))
}