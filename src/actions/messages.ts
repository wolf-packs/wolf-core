import { MessageData } from '../types'

export const SET_MESSAGE_DATA = 'SET_MESSAGE_DATA'
/**
 * Store `messageData` to state for future stages to utilize.
 * Override previous turn's `messageData`.
 */
export const setMessageData = (messageData: MessageData) => ({
  type: SET_MESSAGE_DATA,
  payload: messageData
})
