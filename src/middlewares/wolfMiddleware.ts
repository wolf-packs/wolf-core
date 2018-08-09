import { ConversationState, TurnContext, Promiseable } from 'botbuilder'
import botbuilderReduxMiddleware, { getStore as getReduxStore } from 'botbuilder-redux/dist'
import { Middleware, Store, createStore, applyMiddleware, compose as composeFunc } from 'redux'
import rootReducer from '../reducers'
import { NlpResult, Ability, ConvoState, WolfState, IncomingSlotData } from '../types'
import intake from '../stages/intake'
import fillSlot from '../stages/fillSlot'
import evaluate from '../stages/evaluate'
import execute from '../stages/execute'
import outtake, { OuttakeResult } from '../stages/outtake'

const userMessageDataKey = Symbol('userMessageDataKey')
const wolfMessagesKey = Symbol('wolfMessageKey')

/**
 * Create WolfStore
 * 
 * @param middlewares 
 * @param compose 
 */
export const createWolfStore = (
  middlewares?: Middleware[], 
  compose?: any
) => (
  wolfStateFromConvoState: {[key: string]: any} | null
) => {
  if (typeof middlewares === 'undefined') {
    middlewares = []
  }
  if (typeof compose === 'undefined') {
    compose = composeFunc
  }
  
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
  return createStore(rootReducer, state, compose(applyMiddleware(...middlewares)))
}

/**
 * wolf middleware
 * 
 * @return Promise<>
 */
export default function initializeWolfStoreMiddleware(
  conversationStore: ConversationState,
  userMessageData: (context: TurnContext) => Promiseable<NlpResult>,
  getAbilitiesFunc: (context: TurnContext) => Promiseable<Ability[]>,
  defaultAbility: string,
  storeCreator: (wolfStateFromConvoState: {[key: string]: any} | null) => Store<WolfState>,
  getSlotDataFunc?: (context: TurnContext) => Promiseable<IncomingSlotData[]>
) {
  return [
    botbuilderReduxMiddleware(conversationStore, storeCreator, '__WOLF_STORE__'),
    {
      onTurn: async (context: TurnContext, next: () => any) => {
        if (context.activity.type !== 'message') {
          await next()
        } else {
          const store = getStore(context)
          const nlpResult: NlpResult = await userMessageData(context)
          const abilities: Ability[] = await getAbilitiesFunc(context)
          const convoState: ConvoState = conversationStore.get(context) || {}
          const incomingSlotData: IncomingSlotData[] = getSlotDataFunc ? 
            await getSlotDataFunc(context) : []
          intake(store, nlpResult, incomingSlotData, defaultAbility)
          fillSlot(store, convoState, abilities)
          evaluate(store, abilities, convoState)
          const executeResult = execute(store, convoState, abilities)

          if (executeResult) {
            const { runOnComplete, addMessage } = executeResult
            const messages = await runOnComplete()
            messages.forEach(addMessage)
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

export function getMessages(context: TurnContext): OuttakeResult {
  return context.services.get(wolfMessagesKey)
}
