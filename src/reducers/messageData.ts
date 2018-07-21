import { Reducer } from 'redux'
import { SET_MESSAGE_DATA } from '../actions'

const reducer: Reducer = (prev = {}, action) => {
  if (action.type === SET_MESSAGE_DATA) {
    return {
      ...action.payload
    }
  }
  return prev
}

export default reducer