import { MessageType, MessageQueueItem } from '../types'
import { ActionResult } from './action'

export interface OuttakeResult {
  messageStringArray: string[],
  messageItemArray: MessageQueueItem[]
}

export default function outtake(
  convoState: {[key: string]: any},
  result: ActionResult
): OuttakeResult {
  const pendingWolfState = result

  const createMessage = (messageQueue: MessageQueueItem[], messageType: MessageType) => {
    const queue = messageQueue
      .filter((message: MessageQueueItem) => message.type === messageType)
    const messages = `${queue.map((_: MessageQueueItem) => _.message).join(', ')}`
    return messages
  }

  // order and format messageQueue
  const slotFillMessage = createMessage(pendingWolfState.messageQueue, MessageType.slotFillMessage)
  const abilityMessage = createMessage(pendingWolfState.messageQueue, MessageType.abilityMessage)
  const validateMessage = createMessage(pendingWolfState.messageQueue, MessageType.validateReason)
  const retryMessage = createMessage(pendingWolfState.messageQueue, MessageType.retryMessage)
  const queryMessage = createMessage(pendingWolfState.messageQueue, MessageType.queryMessage)

  const messageStringArray = [
    slotFillMessage,
    abilityMessage,
    validateMessage,
    retryMessage,
    queryMessage
  ].filter((message) => message) // remove all undefined messages
  
  // clear messageQueue for next turn
  pendingWolfState.messageQueue = []
  
  // update wolfState with changes from pendingWolfState
  convoState.wolf = pendingWolfState

  return { messageStringArray, messageItemArray: pendingWolfState.messageQueue } 
}
