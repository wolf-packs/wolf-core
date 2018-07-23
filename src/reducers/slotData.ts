import { Reducer } from 'redux'
import { SlotData } from '../types'
import { CONFIRM_SLOT } from '../actions'

const reducer: Reducer = (prev: SlotData[] = [], action) => {
  if (action.type === CONFIRM_SLOT) {
    const slotIndex = slotData.findIndex((slotData) => slotData.slotName === action.payload.originSlotId)
  }
  return prev
}

export default reducer