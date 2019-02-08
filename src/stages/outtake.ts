import { Store } from 'redux'
import { WolfState, OutputMessageItem, OutputMessageType } from '../types'
import { getOutputMessageQueue } from '../selectors'
import { clearMessageQueue } from '../actions'
const logState = require('debug')('wolf:s5:enterState')
const log = require('debug')('wolf:s5')
export interface OuttakeResult {
  messageStringArray: string[],
  messageItemArray: OutputMessageItem[]
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

  logState(getState())

  // order and format messageQueue
  const slotFillMessage = createMessage(messageQueue, OutputMessageType.slotFillMessage)
  const abilityCompleteMessage = createMessage(messageQueue, OutputMessageType.abilityCompleteMessage)
  const validateMessage = createMessage(messageQueue, OutputMessageType.validateReason)
  const retryMessage = createMessage(messageQueue, OutputMessageType.retryMessage)
  const queryMessage = createMessage(messageQueue, OutputMessageType.queryMessage)
  const nextAbilityMessage = createMessage(messageQueue, OutputMessageType.nextAbilityMessage)

  const messageStringArray = [
    slotFillMessage,
    abilityCompleteMessage,
    nextAbilityMessage,
    validateMessage,
    retryMessage,
    queryMessage
  ].filter((message) => message) // remove all undefined messages

  // store rich message objects
  const messageItemArray = messageQueue

  // clear messageQueue for next turn
  dispatch(clearMessageQueue())

  return { messageStringArray, messageItemArray }
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
