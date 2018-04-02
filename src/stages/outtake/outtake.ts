import { MessageType, MessageQueueItem} from '../../types'
import { ActionResult } from '../actions'

export type OuttakeResult = void

export default function outtake(
  convoState: {[key: string]: any},
  reply: (message: string) => void,
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
  
  // display messageQueue
  if (slotFillMessage) {
    reply(slotFillMessage)
  }
  if (abilityMessage) {
    reply(abilityMessage)
  }
  if (validateMessage) {
    reply(validateMessage)
  }
  if (retryMessage) {
    reply(retryMessage)
  }
  if (queryMessage) {
    reply(queryMessage)
  }
  
  pendingWolfState.messageQueue = []
  
  // update wolfState with pendingWolfState
  convoState.wolf = pendingWolfState
}
