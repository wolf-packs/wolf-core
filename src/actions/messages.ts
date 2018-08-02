import { MessageData, OutputMessageItem } from '../types'

export const SET_MESSAGE_DATA = 'SET_MESSAGE_DATA'
export const ADD_MESSAGE = 'ADD_MESSAGE'

/**
 * Store `messageData` to state for future stages to utilize.
 * Override previous turn's `messageData`.
 */
export const setMessageData = (messageData: MessageData) => ({
  type: SET_MESSAGE_DATA,
  payload: messageData
})

/**
 * Add a message output that should be presented to the user.
 * Developer will have access to this message list.
 */
export const addMessage = (message: OutputMessageItem) => ({
  type: ADD_MESSAGE,
  payload: message
})

/**
 * Clear output message array on state
 * POSTCONDITION: empty array
 */
export const CLEAR_MESSAGE_QUEUE = 'CLEAR_MESSAGE_QUEUE'
export const clearMessageQueue = () => ({
  type: CLEAR_MESSAGE_QUEUE
})
