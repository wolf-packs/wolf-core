import { Store } from 'redux'
import { Activity } from 'botbuilder'
import { WolfState, OutputMessageItem, OutputMessageType } from '../types'
import { getOutputMessageQueue } from '../selectors'
import { clearMessageQueue } from '../actions'
const log = require('debug')('wolf:s5')
export interface OuttakeResult {
  messageStringArray: string[],
  messageItemArray: OutputMessageItem[]
  messageActivityArray: Partial<Activity>[]
}

/**
 * Outtake Stage (S5)
 * 
 * Ensure developer has access to all `OutputMessageItems`
 * 
 * @param store redux
 */
export default function outtake(store: Store<WolfState>): OuttakeResult {
  const { dispatch, getState } = store
  const messageQueue = getOutputMessageQueue(getState())

  // order and format messageQueue
  const slotFillMessage = createMessage(messageQueue, OutputMessageType.slotFillMessage)
  const abilityCompleteMessage = createMessage(messageQueue, OutputMessageType.abilityCompleteMessage)
  const validateMessage = createMessage(messageQueue, OutputMessageType.validateReason)
  const retryMessage = createMessage(messageQueue, OutputMessageType.retryMessage)
  const queryMessage = createMessage(messageQueue, OutputMessageType.queryMessage)

  const messageStringArray = [
    slotFillMessage,
    abilityCompleteMessage,
    validateMessage,
    retryMessage,
    queryMessage
  ].filter((message) => message) // remove all undefined messages

  // store rich message objects
  const messageItemArray = messageQueue

  // clear messageQueue for next turn
  dispatch(clearMessageQueue())

  const messageActivityArray: Partial<Activity>[] = messageStringArray.map((msg) => ({
    type: 'message',
    text: msg
  }))

  return { messageStringArray, messageItemArray, messageActivityArray } 
}

/**
 * Create a single string from grouped messageTypes
 */
const createMessage = (messageQueue: OutputMessageItem[], messageType: OutputMessageType) => {
  const queue = messageQueue
    .filter((item: OutputMessageItem) => item.type === messageType)
    .filter((item: OutputMessageItem) => item.message)
  const messages = `${queue.map((_: OutputMessageItem) => _.message).join(', ')}`
  return messages
}
