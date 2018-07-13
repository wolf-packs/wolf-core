import { Activity, ConsoleTranscriptLogger } from 'botbuilder'
import { MessageType, MessageQueueItem, PendingWolfState, ConvoState } from '../types'

export interface OuttakeResult {
  messageStringArray: string[],
  messageItemArray: MessageQueueItem[]
  messageActivityArray: Partial<Activity>[]
}

const createMessage = (messageQueue: MessageQueueItem[], messageType: MessageType) => {
  const queue = messageQueue
    .filter((item: MessageQueueItem) => item.type === messageType)
    .filter((item: MessageQueueItem) => item.message)
  const messages = `${queue.map((_: MessageQueueItem) => _.message).join(', ')}`
  return messages
}

export default function outtake(
  convoState: ConvoState,
  result: PendingWolfState
): OuttakeResult {
  const pendingWolfState = result

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

  const messageActivityArray: Partial<Activity>[] = messageStringArray.map((msg) => ({
    type: 'message',
    text: msg
  }))

  return { messageStringArray, messageItemArray: pendingWolfState.messageQueue, messageActivityArray } 
}
