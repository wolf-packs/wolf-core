import { Store } from 'redux'
import { WolfState, SlotId } from '../types'
import { getAbilityCompleteOnCurrentTurn, getfilledSlotsOnCurrentTurn, getPromptedSlotStack,
  getFocusedAbility, getDefaultAbility } from '../selectors'
import { setFocusedAbility } from '../actions'

/**
 * Evaluate Stage (S3):
 * 
 * TODO
 * 
 * @param
 * 
 * @returns
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
    focusedAbility = defaultAbility // update local
    dispatch(setFocusedAbility(defaultAbility)) // update state
  }

  // FIND NEXT SLOT TO PROMPT IN FOCUSED ABILITY
  // TODO
  // find next slot to fill in focused ability.. add slot to stack.. exit

  return
}

function findNextSlotToPrompt(): SlotId {
  const nextSlot: SlotId = {
    slotName: '',
    abilityName: ''
  }

  return nextSlot
}
