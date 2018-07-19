import { ConversationState, TurnContext, Promiseable } from 'botbuilder'
import botbuilderReduxMiddleware, { getStore as getReduxStore } from 'botbuilder-redux/dist'
import { createStore, combineReducers } from 'redux'
import rootReducer from '../reducers'
import { MessageData, NlpResult } from '../types'
import intake from '../stages/intake';

const userMessageDataKey = Symbol('userMessageDataKey')
const wolfMessagesKey = Symbol('wolfMessageKey')

const storeCreator = (wolfStateFromConvoState: {[key: string]: any} | null) => {
  
  const defaultWolfState = {
    messageData: {}
  }
  const state = wolfStateFromConvoState || defaultWolfState
  return createStore(rootReducer, state)
}

/**
 * Initialize wolf state
 * 
 * @return Promise<>
 */
export default function initializeWolfStoreMiddleware(
  conversationStore: ConversationState,
  userMessageData: (context: TurnContext) => Promiseable<NlpResult>
) {
  return [
    botbuilderReduxMiddleware(conversationStore, storeCreator, '__WOLF_STORE__'),
    {
      onTurn: async (context: TurnContext, next: () => any) => {
        const store = getStore(context)
        const nlpResult: NlpResult = await userMessageData(context)
        intake(store, nlpResult)
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
