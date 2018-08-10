import { Reducer } from 'redux'
import { SET_MESSAGE_DATA } from '../actions'
import { MessageData } from '../types'

const defaultMessageData = {
  rawText: '',
  intent: null,
  entities: []
}

const reducer: Reducer = (prev: MessageData = defaultMessageData, action) => {
  if (action.type === SET_MESSAGE_DATA) {
    return {
      ...action.payload
    }
  }
  return prev
}

export default reducer
