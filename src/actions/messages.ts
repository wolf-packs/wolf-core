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

// FILL SLOT

export const SET_SLOT_PENDING_DATA = 'SET_SLOT_PENDING_DATA'

export const setSlotPendingData = (value: any) => ({
  type: SET_SLOT_PENDING_DATA,
  payload: value
})