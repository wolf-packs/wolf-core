import { Reducer } from 'redux'
import { SlotStatus } from '../types'
import { CONFIRM_SLOT } from '../actions'
import { changeArrayItemOnIndex } from '../helpers'

const reducer: Reducer = (prev: SlotStatus[] = [], action) => {
  if (action.type === CONFIRM_SLOT) {
    const slotIndex = prev.findIndex(slotStatus => slotStatus.slotName === action.payload.originSlotId 
      && slotStatus.abilityName === action.payload.confirmationSlotId)

    const slot: SlotStatus = {
      ...prev[slotIndex],
      confirmationSlot: action.payload.confirmationSlotId
    }

    return changeArrayItemOnIndex(prev, slotIndex, slot)
  }
  return prev
}

export default reducer