import { SlotRecord } from '../types'
import { Reducer } from 'redux'
import { FILL_SLOT } from '../actions'

const reducer: Reducer = (prev: SlotRecord[] = [], action): SlotRecord[] => {
  if (action.type === FILL_SLOT) {
    return [...prev, action.payload]
  }
  
  return prev
}

export default reducer
