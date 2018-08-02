import { OutputMessageItem, OutputMessageType, WolfState } from '../types'

export function addMessageToQueue(
  state: WolfState,
  message: string,
  messageType: OutputMessageType = OutputMessageType.abilityCompleteMessage,
  slotName?: string
): WolfState {
  let messageItem: OutputMessageItem = {
    message,
    type: messageType,
    slotName
  }

  const updatedState = Object.assign({}, state)
  updatedState.outputMessageQueue.push(messageItem)
  return updatedState
}
