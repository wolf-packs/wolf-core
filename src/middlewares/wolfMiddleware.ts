import { ConversationState, TurnContext, Promiseable } from 'botbuilder'
import botbuilderReduxMiddleware, { getStore as getReduxStore } from 'botbuilder-redux/dist'
import { Store, createStore, applyMiddleware, compose } from 'redux'
import rootReducer from '../reducers'
import { NlpResult, Ability, ConvoState, WolfState } from '../types'
import intake from '../stages/intake'
import fillSlot from '../stages/fillSlot'
import evaluate from '../stages/evaluate'
import execute from '../stages/execute'
import outtake from '../stages/outtake'

const userMessageDataKey = Symbol('userMessageDataKey')
const wolfMessagesKey = Symbol('wolfMessageKey')

/**
 * wolf middleware
 * 
 * @return Promise<>
 */
export default function initializeWolfStoreMiddleware(
  conversationStore: ConversationState,
  userMessageData: (context: TurnContext) => Promiseable<NlpResult>,
  abilities: Ability[],
  defaultAbility: string,
  devTools: {enabled: boolean, port?: number} = {enabled: false}
) {
  let composeEnhancers = compose
  if (devTools.enabled) {
    const remotedev = require('remotedev-server')
    const { composeWithDevTools } = require('remote-redux-devtools')
    remotedev({ hostname: 'localhost', port: devTools.port || 8100 })
    composeEnhancers = composeWithDevTools({ realtime: true, port: 8100, latency: 0 })
  }

  const storeCreator = (wolfStateFromConvoState: {[key: string]: any} | null) => {
    const defaultWolfState = {
      messageData: null,
      slotStatus: [],
      slotData: [],
      abilityStatus: [],
      promptedSlotStack: [],
      focusedAbility: null,
      outputMessageQueue: [],
      filledSlotsOnCurrentTurn: [],
      abilitiesCompleteOnCurrentTurn: [],
      defaultAbility: null
    }
    const state = wolfStateFromConvoState || defaultWolfState
    return createStore(rootReducer, state, composeEnhancers(applyMiddleware()))
  }

  return [
    botbuilderReduxMiddleware(conversationStore, storeCreator, '__WOLF_STORE__'),
    {
      onTurn: async (context: TurnContext, next: () => any) => {
        if (context.activity.type !== 'message') {
          await next()
        } else {
          const store = getStore(context)
          const nlpResult: NlpResult = await userMessageData(context)
          const convoState: ConvoState = conversationStore.get(context) || {}
          intake(store, nlpResult, defaultAbility)
          fillSlot(store, convoState, abilities)
          evaluate(store, abilities, convoState)
          const {runOnComplete, addMessage} = execute(store, convoState, abilities)
          
          const message = await runOnComplete()
          if (message) {
            addMessage(message)
          }

          const messagesObj = outtake(store)

          // save the messages in context.services
          context.services.set(wolfMessagesKey, messagesObj)
          await next()
        }
      }
   }]
}

export function getStore(context: TurnContext): Store<WolfState> {
  return getReduxStore(context, '__WOLF_STORE__')
}

export function getMessages(context: TurnContext) {
  return context.services.get(wolfMessagesKey)
}
