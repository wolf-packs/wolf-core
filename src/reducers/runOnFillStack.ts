import { Reducer } from 'redux'
import { ADD_SLOT_TO_ON_FILL_STACK, REMOVE_SLOT_FROM_ON_FILL_STACK } from '../actions'
import { OnFillStackItem } from '../types'
import { removeSlotFromSlotIdArray } from '../helpers'

const reducer: Reducer = (prev: OnFillStackItem[] = [], action): OnFillStackItem[] => {
  if (action.type === ADD_SLOT_TO_ON_FILL_STACK) {
    const slotToAdd = {
      slotName: action.payload.slotName,
      abilityName: action.payload.abilityName,
      message: action.payload.value
    }
    return [
      ...prev,
      slotToAdd
    ]
  }

  if (action.type === REMOVE_SLOT_FROM_ON_FILL_STACK) {
    const slotToRemove: OnFillStackItem = action.payload
    const {slotName, abilityName} = slotToRemove
    const updatedState = removeSlotFromSlotIdArray(prev, {slotName, abilityName})
    return updatedState
  }
  return prev
}

export default reducer
