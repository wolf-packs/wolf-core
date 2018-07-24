import { Reducer } from 'redux'
import { SET_DEFAULT_ABILITY } from '../actions'

const reducer: Reducer = (prev: string | null = null, action) => {
  if (action.type === SET_DEFAULT_ABILITY) {
    return action.payload
  }
  return prev
}

export default reducer