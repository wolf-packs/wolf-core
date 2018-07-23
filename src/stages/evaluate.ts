import { Store } from 'redux'
import { WolfState, SlotId } from '../types'
import { getAbilityCompleteOnCurrentTurn, getfilledSlotsOnCurrentTurn, getPromptedSlotStack,
  getFocusedAbility, getDefaultAbility } from '../selectors'
import { setFocusedAbility } from '../actions'

/**
 * Evaluate Stage (S3):
 * 
 * Responsible for ensuring S4 (execute stage) has a slot or ability action to run.
 * S3 will ensure that `abilityCompleteOnCurrentTurn` and `promptedSlotStack` are up-to-date.
 * This will inform S4 for the next item to execute.
 * 
 * @param dispatch redux
 * @param getState redux
 * 
 * @returns void
 */
export default function evaluate({ dispatch, getState }: Store<WolfState>): void {
  const state: WolfState = getState()

  // Check if ability is marked to run onComplete this turn
  const abilityCompleteResult = getAbilityCompleteOnCurrentTurn(state)
  if (abilityCompleteResult) {
    return // exit stage.. S4 will run ability.onComplete()
  }

  // Check if there were any slots filled during this turn
  const filledSlotsResult = getfilledSlotsOnCurrentTurn(state)
  if (filledSlotsResult.length > 0) {
    // Check if any abilities have been completed as a result of the filled slot(s)
    // state.slotData...
    // if yes... return
  }

  // NO ABILITY TO COMPLETE THIS TURN.. check stack
  const promptedSlotStack = getPromptedSlotStack(state)

  // Check if there are slots in the stack
  if (promptedSlotStack.length > 0) {
    // slot in the stack
    // regardless of promptSlot.prompted, exit S3
    // if prompted = false.. S4 should prompt slot
    // if prompted = true.. S4 shoudld do nothing
    return
  }

  // PROMPT STACK HAS NO ITEMS

  let focusedAbility = getFocusedAbility(state)
  if (!focusedAbility) {
    // focusedAbility is null, use default ability
    const defaultAbility = getDefaultAbility(state)

    // check if defaultAbility is null
    if (!defaultAbility) {
      // focusedAbility and Default ability are both null..
      // no slots will be found.
      return
    }

    // defaultAbility is a string
    focusedAbility = defaultAbility // update local
    dispatch(setFocusedAbility(defaultAbility)) // update state
  }

  // FIND NEXT SLOT TO PROMPT IN FOCUSED ABILITY

  const nextSlot = findNextSlotToPrompt(state, focusedAbility)

  // create prompt slot
  // add prompt slot to top of stack

  // find next slot to fill in focused ability.. add slot to stack.. exit

  return
}

function findNextSlotToPrompt(state: WolfState, focusedAbility: string): SlotId {
  const nextSlot: SlotId = {
    slotName: '',
    abilityName: ''
  }

  return nextSlot
}
