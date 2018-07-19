import { ConversationState, TurnContext } from 'botbuilder'
import botbuilderReduxMiddleware, { getStore as getReduxStore } from 'botbuilder-redux'
import { createStore, combineReducers } from 'redux'

const storeCreator = (wolfStateFromConvoState: any) => {
  const reducer = combineReducers({}) // TODO: this is where to put all the reducers
  const defaultWolfState = {}
  const state = wolfStateFromConvoState || defaultWolfState
  return createStore(reducer, state)
}

/**
 * Initialize wolf state
 * 
 * @return Promise<>
 */

export default function initializeWolfStore(conversationStore: ConversationState) {
  return {
    onTurn: async (context: TurnContext, next: () => any) => {
      // Load convo state from the store
      const reduxMiddleware = botbuilderReduxMiddleware(conversationStore, storeCreator, '__WOLF_STORE__')
      await reduxMiddleware.onTurn(context, next)
      // Check if wolf state exists
      await next()
    }
  }
}

export function getStore(context: TurnContext) {
  return getReduxStore(context, '__WOLF_STORE__')
}