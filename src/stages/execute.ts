import { Store, Action, Dispatch } from 'redux'
import { WolfState, Ability, Slot, ConvoState, OutputMessageType, SlotId } from '../types'
import { getAbilityCompleteOnCurrentTurn, getPromptedSlotStack,
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
  const state: WolfState = getState()

  // Check if S4 should run an ability onComplete
  const abilityCompleteResult = getAbilityCompleteOnCurrentTurn(state)
  if (abilityCompleteResult) {
    const valueOrPromise = runAbilityOnComplete(state, convoState, abilities, abilityCompleteResult)

    /////////////////////
    // TODO.. figure out what to return..
    let returnResult: Promise<string|void> = Promise.resolve()
    if (typeof valueOrPromise === 'string') {
      returnResult = Promise.resolve(valueOrPromise)
    }
  
    if (typeof valueOrPromise.then === 'function') {
      returnResult = Promise.resolve()
    }
    /////////////////////

    return { runOnComplete: () => returnResult }
  }

  // Check if S4 should prompt a slot
  const promptedSlotStack = getPromptedSlotStack(state)
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

function runAbilityOnComplete(
  state: WolfState,
  convoState: ConvoState,
  abilities: Ability[],
  abilityToComplete: string
): Promise<string|void> | string | void {
  const ability = abilities.find((ability) => ability.name === abilityToComplete)
  if (!ability) {
    return Promise.resolve()
  }

  const abilitySlotData = getSlotDataByAbilityName(state, ability.name)
  const valueOrPromise = ability.onComplete(convoState, abilitySlotData)
  return valueOrPromise
}

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

// ACTION

/**
 * Set slot.prompted property
 */
export const SET_SLOT_PROMPTED = 'SET_SLOT_PROMPTED'
export const setSlotPrompted = (slotId: SlotId, value: boolean) => ({
  type: SET_SLOT_PROMPTED,
  payload: { slotId, value }
})
