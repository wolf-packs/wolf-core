import { ConversationState, TurnContext } from 'botbuilder'
import botbuilderReduxMiddleware, { getStore as getReduxStore } from 'botbuilder-redux/dist'
import { createStore, combineReducers } from 'redux'

const wolfMessagesKey = Symbol('wolfMessageKey')

const storeCreator = (wolfStateFromConvoState: {[key: string]: any} | null) => {
  const reducer = combineReducers({
    messageData: (prev, action) => {
      if (action.type === 'SET_MESSAGE_DATA') {
        return action.payload
      }
      return prev
    }
  }) // TODO: this is where to put all the reducers
  const defaultWolfState = {
    messageData: {}
  }
  const state = wolfStateFromConvoState || defaultWolfState
  return createStore(reducer, state)
}

/**
 * Initialize wolf state
 * 
 * @return Promise<>
 */

export default function initializeWolfStoreMiddleware(conversationStore: ConversationState) {
  return [
    botbuilderReduxMiddleware(conversationStore, storeCreator, '__WOLF_STORE__'),
    {
    onTurn: async (context: TurnContext, next: () => any) => {
      const store = getStore(context)
      
      // Do our wolf stages here

      const messages = {} // result of outtake

      // save the messages in context.services
      context.services.set(wolfMessagesKey, messages)
      await next()
    }
    }]
}

export function getStore(context: TurnContext) {
  return getReduxStore(context, '__WOLF_STORE__')
}

export function getMessages(context: TurnContext) {
  return context.services.get(wolfMessagesKey)
}