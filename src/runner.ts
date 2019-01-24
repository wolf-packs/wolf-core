import { Middleware, Store, createStore, applyMiddleware, compose as composeFunc, AnyAction } from 'redux'
import rootReducer from './reducers'
import { NlpResult, Ability, WolfState, IncomingSlotData, SetSlotDataFunctions, Promiseable, WolfStore } from './types'
import intake from './stages/intake'
import fillSlot from './stages/fillSlot'
import evaluate from './stages/evaluate'
import execute from './stages/execute'
import outtake from './stages/outtake'
import { fillSlot as fillSlotAction, enableSlot, disableSlot, setSlotDone, addSlotToOnFillStack } from './actions'

/**
 * Returns the default Wolf State that should be initialized onto the conversation state
 * at the beginning of every conversation. This is meant for Wolf usage only.
 */
const getDefaultWolfState = () => {
  return {
    messageData: null,
    slotStatus: [],
    slotData: [],
    abilityStatus: [],
    promptedSlotStack: [],
    focusedAbility: null,
    outputMessageQueue: [],
    filledSlotsOnCurrentTurn: [],
    abilitiesCompleteOnCurrentTurn: [],
    defaultAbility: null,
    runOnFillStack: []
  }
}

/**
 * Creates a WolfStore creator function. Store will be used to maintain Wolf State throughout stages.
 * 
 * @param middlewares 
 * @param compose 
 * @returns Wolf Store
 */
export const makeWolfStoreCreator = (
  middlewares?: Middleware[],
  compose?: any
) => (
  wolfState: { [key: string]: any } | null
) => {
    if (typeof middlewares === 'undefined') {
      middlewares = []
    }
    if (typeof compose === 'undefined') {
      compose = composeFunc
    }

    const state = wolfState || getDefaultWolfState()
    return createStore(rootReducer, state, compose(applyMiddleware(...middlewares)))
  }

/**
 * The main Wolf function that should be run at the beginning of every conversation turn.
 * 
 * @param conversationState Conversation persistent state per conversation session
 * @param userMessageData Natural Language Processing result
 * @param getAbilitiesFunc Abilities defined for the bot
 * @param defaultAbility Ability that will be used as the fallback if no ability is determined from the userMessageData
 * @param storeCreator Optional redux store creator, can be used with redux dev tools
 * @param getSlotDataFunc Optional getter function to retrieve slot data
 * @returns OuttakeResult containing an array of output messages
 */
export const run = async <T extends object>(
  conversationState: T,
  wolfState: WolfState | null,
  userMessageData: () => Promiseable<NlpResult>,
  getAbilitiesFunc: () => Promiseable<Ability[]>,
  defaultAbility: string,
  storeCreator?: (wolfStateFromConvoState: { [key: string]: any } | null) => Store<WolfState>,
  getSlotDataFunc?: (setSlotFuncs: SetSlotDataFunctions) => Promiseable<IncomingSlotData[]>
) => {
  // If user provides storeCreator param, invoke the redux store creator with the persisted wolfState (if available)
  // By defualt, redux store creator is invoked with the available wolfState
  // In either case, if wolfState is null, the storeCreator will instantiate a new defualt Wolf State
  const wolfStore: WolfStore = storeCreator ? storeCreator(wolfState) : makeWolfStoreCreator()(wolfState)

  // Run Wolf Stages
  const nlpResult: NlpResult = await userMessageData()
  const abilities: Ability[] = await getAbilitiesFunc()
  const convoState: T = conversationState
  const incomingSlotData: IncomingSlotData[] = getSlotDataFunc ?
    await getSlotDataFunc({
      setSlotValue: (abilityName, slotName, value) => {
        wolfStore.dispatch(fillSlotAction(slotName, abilityName, value))
      },
      setSlotEnabled: (abilityName, slotName, enable) => {
        if (enable) {
          wolfStore.dispatch(enableSlot({ abilityName, slotName }))
          return
        }
        wolfStore.dispatch(disableSlot({ abilityName, slotName }))
      },
      setSlotDone: (abilityName, slotName, done) => {
        wolfStore.dispatch(setSlotDone({ abilityName, slotName }, done))
      },
      fulfillSlot: (abilityName, slotName, value) => {
        wolfStore.dispatch(addSlotToOnFillStack({ slotName, abilityName }, value))
      }
    }) : []
  intake(wolfStore, nlpResult, incomingSlotData, defaultAbility)
  fillSlot(wolfStore, convoState, abilities)
  evaluate(wolfStore, abilities, convoState)
  const executeResult = execute(wolfStore, convoState, abilities)

  if (executeResult) {
    const { runOnComplete, addMessage } = executeResult
    const messages = await runOnComplete()
    messages.forEach(addMessage)
  }

  const wolfResult = outtake(wolfStore)

  return {
    retrieveWolfState: () => wolfStore.getState(),
    retrieveConversationState: () => convoState,
    wolfResult
  }
}
