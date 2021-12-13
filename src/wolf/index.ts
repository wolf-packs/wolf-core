import { Middleware, Store, createStore, applyMiddleware, compose as composeFunc } from 'redux'
import rootReducer from '../reducers'
import {
  NlpResult, WolfState, IncomingSlotData, SetSlotDataFunctions, Promiseable,
  WolfStore, WolfStateStorage, AnyObject, Flow
} from '../types'
import intake from '../stages/intake'
import fillSlot from '../stages/fillSlot'
import evaluate from '../stages/evaluate'
import execute from '../stages/execute'
import outtake from '../stages/outtake'
import { fillSlot as fillSlotAction, enableSlot, disableSlot, setSlotDone, addSlotToOnFillStack } from '../actions'

/**
 * Returns the default Wolf State that should be initialized onto the conversation state
 * at the beginning of every conversation. This is meant for Wolf usage only.
 */
export const getDefaultWolfState = (): WolfState => {
  return {
    messageData: {
      rawText: '',
      intent: null,
      entities: []
    },
    slotStatus: [],
    slotData: [],
    slotRecords: [],
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
 * The main Wolf function that will execute all wolf stages and yield the recommended next move
 * in the conversation flow. Wolf run is stateless but requires the following parameters..
 * 
 * @param wolfStorage Wolf state storage layer. Wolf will handle saving wolf state
 * @param convoStorage User conversation state storage layer. Read/save will be made available
 * to user functions in slot and abilities
 * @param userMessageData An array of Natural Language Processing results
 * // TODO: update getFlowFunc to include more detail: such as the possibility to incorporate backend or 3rd party ability, given that it is an async func.
 * @param getFlowFunc Flow is made up of Abilities and Slots and are used to define the bot conversation flow
 * // TODO: discussion: is this the best place for defaultAbility to be in the run function argument?
 * @param defaultAbility Ability that will be used as the fallback if no ability is determined from the userMessageData
 * @param storeCreator Optional redux store creator, can be used with redux dev tools
 * // TODO: potentially change the function name (should be read as "get SlotDataFunctions")
 * @param getSlotDataFunc Optional getter function to retrieve slot data
 * @returns Wolf's result containing an array of output messages (to respond to the user)
 */
export const run = async <T extends AnyObject, G>(
  wolfStorage: WolfStateStorage,
  convoStorage: G,
  userMessageData: () => Promiseable<NlpResult[]>,
  getFlowFunc: () => Promiseable<Flow<T, G>>,
  defaultAbility: string,
  storeCreator?: (wolfStateFromConvoState: { [key: string]: any } | null) => Store<WolfState>,
  getSlotDataFunc?: (setSlotFuncs: SetSlotDataFunctions) => Promiseable<IncomingSlotData[]> // (setSlotFuncs) => { if (user.name == 'hao' ) {setSlotFuncs.fulfillSlot('profile', 'food', 'chinese food')} }
) => {
  // invoke user async functions
  const [wolfState, nlpResultArr, flow] = await Promise.all([
    wolfStorage.read(),
    userMessageData(),
    getFlowFunc()
  ])

  // If user provides storeCreator param, invoke the redux store creator with the persisted wolfState (if available)
  // By default, redux store creator is invoked with the available wolfState
  // In either case, if wolfState is null, the storeCreator will instantiate a new default Wolf State
  const wolfStore: WolfStore = storeCreator ? storeCreator(wolfState) : makeWolfStoreCreator()(wolfState)

  const incomingSlotData: IncomingSlotData[] = getSlotDataFunc ?
    // Run Wolf Stages
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
  intake(wolfStore, nlpResultArr, incomingSlotData, defaultAbility)
  await fillSlot(wolfStore, convoStorage, flow)
  // TODO: swap argument order in `evaluate` method
  await evaluate(wolfStore, flow, convoStorage)
  const executeResult = await execute(wolfStore, convoStorage, flow)

  if (executeResult) {
    const { runOnComplete, addMessage } = executeResult
    const messages = await runOnComplete()
    messages.forEach(addMessage)
  }

  // Save wolf state by invoking user defined save function
  const result = outtake(wolfStore)

  await wolfStorage.save(wolfStore.getState())

  return result
}
