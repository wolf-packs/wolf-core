import { Reducer } from 'redux'
import { SET_FOCUSED_ABILITY } from '../actions'
const reducer: Reducer = (prev: string|null = null, action): string|null => {
  if (action.type === SET_FOCUSED_ABILITY) {
    return action.payload
  }
  
  return prev
}

export default reducer
