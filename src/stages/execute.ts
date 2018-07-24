import { Store, Action, Dispatch } from 'redux'
import { WolfState, Ability, Slot, ConvoState, OutputMessageType, SlotId } from '../types'
import { getAbilitiesCompleteOnCurrentTurn, getPromptedSlotStack,
    getSlotBySlotId, getSlotDataByAbilityName } from '../selectors';
import { addMessage } from '../actions';

export interface ExecuteResult {
  runOnComplete: () => Promise<string|void>
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

    return { runOnComplete: () => returnResult }
  }

  // Check if S4 should prompt a slot
  const promptedSlotStack = getPromptedSlotStack(getState())
  if (promptedSlotStack[0]) {
    const slot = promptedSlotStack[0]

    // check if slot is already prompted
    if (slot.prompted) {
      return { runOnComplete: () => Promise.resolve() }
    }

    // slot has not been prompted yet.. prompt here
    const slotToPrompt = getSlotBySlotId(abilities, { slotName: slot.slotName, abilityName: slot.abilityName })
    if (slotToPrompt) {
      const runSlotQueryResult = runSlotQuery(convoState, slotToPrompt, slot.abilityName)
      runSlotQueryResult.forEach(dispatchActionArray(dispatch))
      return { runOnComplete: () => Promise.resolve() }
    }
    // SLOT NOT VALID.. continue
  }
  
  // NO ABILITY TO COMPLETE..
  // NO SLOT TO PROMPT..
  return { runOnComplete: () => Promise.resolve() }
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
  const valueOrPromise = ability.onComplete(convoState, abilitySlotData)
  return valueOrPromise
}

/**
 * Ececute slot.query()
 */
function runSlotQuery(convoState: ConvoState, slot: Slot, abilityName: string): Action[] {
  const queryString = slot.query(convoState)

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
  return [addMessage(message), setSlotPrompted(slotId, true)]
}

/**
 * Dispatch on all Action items in array.
 */
const dispatchActionArray = (dispatch: Dispatch) => (action: Action): void => {
  dispatch(action)
}

// ACTION TODO: move to action and implement

/**
 * Set slot.prompted property
 */
export const SET_SLOT_PROMPTED = 'SET_SLOT_PROMPTED'
export const setSlotPrompted = (slotId: SlotId, value: boolean) => ({
  type: SET_SLOT_PROMPTED,
  payload: { slotId, value }
})
