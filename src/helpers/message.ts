import { MessageType, MessageQueueItem, PendingWolfState } from '../types'

export function addMessageToQueue(
  pendingWolfState: PendingWolfState,
  message: string,
  messageType: MessageType = MessageType.slotFillMessage,
  slotName?: string
): PendingWolfState {
  let messageItem: MessageQueueItem = {
    message,
    type: messageType,
    slotName
  }

  const updatedState = Object.assign({}, pendingWolfState)
  updatedState.messageQueue.push(messageItem)
  return updatedState
}
