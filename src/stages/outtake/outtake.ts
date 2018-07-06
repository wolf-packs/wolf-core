import { MessageType, MessageQueueItem } from '../../types'
import { ActionResult } from '../actions'

export type OuttakeResult = string[]

export default function outtake(
  // TODO: changed to set wolfstate
  state: {[key: string]: any},
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

  const messageArray = [
    slotFillMessage,
    abilityMessage,
    validateMessage,
    retryMessage,
    queryMessage
  ].filter((message) => message) // remove all undefined messages
  
  // clear messageQueue for next turn
  pendingWolfState.messageQueue = []
  
  // update wolfState with pendingWolfState
  state.wolf = pendingWolfState

  return messageArray
}
