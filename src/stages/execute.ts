import { Store, Action, Dispatch } from 'redux'
import { WolfState, Ability, Slot, ConvoState,
  OutputMessageType, SlotId, SlotData, GetSlotDataFunctions } from '../types'
import { getAbilitiesCompleteOnCurrentTurn, getPromptedSlotStack,
    getSlotBySlotId, getSlotDataByAbilityName, getTargetAbility, getAbilityStatus } from '../selectors'
import { addMessage as addMessageAction, setSlotPrompted, setFocusedAbility, setAbilityStatus } from '../actions'
import { findInSlotIdItemBySlotId } from '../helpers'

export interface ExecuteResult {
  runOnComplete: () => Promise<string|void>,
  addMessage: (msg: string) => void
}

const makeSubmittedDataFromSlotData = (slotData: SlotData[]) => {
  return slotData.reduce((prev, current) => ({
    ...prev,
    [current.slotName]: current.value
  }), {})
}

/**
 * Execute Stage (S4):
 * 
 * Responsible for executing an ability onComplete, slot query or bypass.
 * 
 * @param store redux
 * @param convoState conversationState
 * @param abilities user defined abilities and slots
 */
export default function execute(store: Store<WolfState>, convoState: ConvoState, abilities: Ability[]): ExecuteResult {
  const { dispatch, getState } = store

  const addMessage = (msg: string) => dispatch(
    addMessageAction({message: msg, type: OutputMessageType.abilityCompleteMessage})
  )

  // TODO: refactor
  let onCompleteReturnResult = null

  // Check if S4 should run an ability onComplete
  const abilityCompleteResult = getAbilitiesCompleteOnCurrentTurn(getState())
  if (abilityCompleteResult.length > 0) {
    const valueOrPromise = runAbilityOnComplete(getState, convoState, abilities, abilityCompleteResult[0])

    let returnResult: Promise<string|void>
    if (typeof valueOrPromise === 'string') {
      returnResult = Promise.resolve(valueOrPromise)
    } else if (!valueOrPromise) {
      // void
      returnResult = Promise.resolve()
    } else if (typeof valueOrPromise.then === 'function') {
      // promise
      returnResult = valueOrPromise
    }

    // set ability status to complete
    dispatch(setAbilityStatus(abilityCompleteResult[0], true))
    
    onCompleteReturnResult = { runOnComplete: () => returnResult, addMessage }
    // return { runOnComplete: () => returnResult, addMessage }
  }

  // Check if S4 should prompt a slot
  const promptedSlotStack = getPromptedSlotStack(getState())
  if (promptedSlotStack[0]) {
    const slot = promptedSlotStack[0]

    // check if slot is already prompted
    if (slot.prompted) {
      return { runOnComplete: () => Promise.resolve(), addMessage }
    }

    // slot has not been prompted yet.. prompt here
    const slotToPrompt = getSlotBySlotId(abilities, { slotName: slot.slotName, abilityName: slot.abilityName })
    if (slotToPrompt) {
      const runSlotQueryResult = runSlotQuery(convoState, store, slotToPrompt, slot.abilityName)
      runSlotQueryResult.forEach(dispatchActionArray(dispatch))

      if (onCompleteReturnResult) {
        return onCompleteReturnResult
      }
      return { runOnComplete: () => Promise.resolve(), addMessage }
    }
    // SLOT NOT VALID.. continue
  }
  
  // NO ABILITY TO COMPLETE..
  // NO SLOT TO PROMPT..
  return { runOnComplete: () => Promise.resolve(), addMessage }
}

/**
 * Execute ability.onComplte()
 */
function runAbilityOnComplete(
  getState: () => WolfState,
  convoState: ConvoState,
  abilities: Ability[],
  abilityToComplete: string
): Promise<string|void> | string | void {
  const ability = abilities.find((ability) => ability.name === abilityToComplete)
  if (!ability) {
    return Promise.resolve()
  }

  const abilitySlotData = getSlotDataByAbilityName(getState(), ability.name)
  const submittedData = makeSubmittedDataFromSlotData(abilitySlotData)

  return ability.onComplete(convoState, submittedData)
}

/**
 * makeGetSlotFillFunctions
 * 
 * create an object that has the correct getters for slot information
 */
function makeGetSlotDataFunctions({getState}: Store<WolfState>, abilityName: string): GetSlotDataFunctions {
  const wolfState = getState()
  const {slotStatus, slotData} = wolfState
  return {
    getSlotStatus: <SlotStatus>(slotName: string) => findInSlotIdItemBySlotId(slotStatus, {abilityName, slotName}),
    getSlotValue: <SlotData>(slotName: string) => findInSlotIdItemBySlotId(slotData, {abilityName, slotName})
  }
}

/**
 * Execute slot.query()
 */
function runSlotQuery(convoState: ConvoState, store: Store<WolfState>, slot: Slot, abilityName: string): Action[] {
  const getSlotDataFunctions = makeGetSlotDataFunctions(store, abilityName)
  const queryString = slot.query(convoState, getSlotDataFunctions)

  // add query to output message queue
  const message = {
    message: queryString,
    type: OutputMessageType.queryMessage,
    slotName: slot.name,
    abilityName
  }
  const slotId: SlotId = {
    slotName: slot.name,
    abilityName
  }
  return [addMessageAction(message), setSlotPrompted(slotId, true)]
}

/**
 * Dispatch on all Action items in array.
 */
const dispatchActionArray = (dispatch: Dispatch) => (action: Action): void => {
  dispatch(action)
}
