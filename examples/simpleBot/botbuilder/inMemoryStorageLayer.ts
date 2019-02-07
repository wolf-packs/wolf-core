import { ConversationState, TurnContext } from 'botbuilder'
import * as wolf from '../../../src'

// TODO: JSDocs
export const createInMemoryStorageLayer = <T>(
  conversationState: ConversationState,
  statePropertyName: string = 'CONVERSATION_STATE'
) => {
  const convoStore = conversationState.createProperty(statePropertyName)
  return (botbuilderTurnContext: TurnContext, initialState?: T) => {
    const convoStateStorage: wolf.StorageLayer<T> = {
      read: async () => {
        return await convoStore.get(botbuilderTurnContext, initialState)
      },
      save: async (newState) => {
        // TODO: Why we chose to do this?
        // remove old keys
        const oldState = conversationState.get(botbuilderTurnContext)
        const oldKeys = Object.keys(oldState)
        oldKeys.forEach((key) => {
          delete oldState[key]
        })

        // save new keys
        const keys = Object.keys(newState)
        keys.forEach((key) => {
          oldState[key] = newState[key]
        })

        // save back to botbuilder context
        await conversationState.saveChanges(botbuilderTurnContext)
      }
    }
    return convoStateStorage
  }
}
