import { Reducer } from 'redux'
import { OutputMessageItem } from '../types'
import { ADD_MESSAGE, CLEAR_MESSAGE_QUEUE } from '../actions'

const reducer: Reducer = (prev: OutputMessageItem[] = [], action) => {
  if (action.type === ADD_MESSAGE) {
    return [
      ...prev,
      action.payload
    ]
  }

  if (action.type === CLEAR_MESSAGE_QUEUE) {
    return []
  }
  
  return prev
}

export default reducer
