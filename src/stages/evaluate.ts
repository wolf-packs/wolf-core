import { Store } from 'redux'
import { WolfState, Ability, SlotId, Slot } from '../types'
import { getAbilityCompleteOnCurrentTurn, getfilledSlotsOnCurrentTurn, getPromptedSlotStack,
  getFocusedAbility, getDefaultAbility, getSlotStatus, getSlotData, getTargetAbility } from '../selectors'
import { setFocusedAbility, setAbilityCompleteOnCurrentTurn } from '../actions'
import { addSlotTopPromptedStack } from '../helpers';

/**
 * Evaluate Stage (S3):
 * 
 * Responsible for ensuring S4 (execute stage) has a slot or ability action to run.
 * S3 will ensure that `abilityCompleteOnCurrentTurn` and `promptedSlotStack` are up-to-date.
 * This will inform S4 for the next item to execute.
 * 
 * @param store redux
 * @param abilities user defined abilities and slots
 */
export default function evaluate(store: Store<WolfState>, abilities: Ability[]): void {
  const { dispatch, getState } = store
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
    const abilityName = checkForAbilityCompletion(state, abilities)

    if (abilityName) {
      // ability complete
      dispatch(setAbilityCompleteOnCurrentTurn(abilityName))
      return // exit stage.. S4 will run ability.onComplete()
    }
    // no ability has completed.. continue
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

  const nextSlot = findNextSlotToPrompt(state, abilities)

  if (!nextSlot) {
    return // no slots to prompt
  }

  // ADD SLOT TO PROMPTED STACK
  addSlotTopPromptedStack(dispatch, nextSlot.slotName, nextSlot.abilityName)
  return
}

/**
 * Find the next enabled and pending slot in the `focusedAbility` to be prompted
 * 
 * @param state 
 * @param abilities 
 * @param focusedAbility 
 */
function findNextSlotToPrompt(state: WolfState, abilities: Ability[]): SlotId | null {
  const focusedAbility = getFocusedAbility(state)
  if (!focusedAbility) {
    return null
  }

  const enabledSlots = getUnfilledSlots(state, abilities, focusedAbility)

  if (enabledSlots.length === 0) {
    return null // no slots need to be filled in current focused ability
  }

  // REMAINING SLOTS NEED TO BE FILLED
  // sort slots by order value
  const sortedSlots = enabledSlots.sort((a, b) => {
    if (!a.order) { a.order = 100 }
    if (!b.order) { b.order = 100 }
    return a.order - b.order
  })

  return {
    slotName: sortedSlots[0].name,
    abilityName: focusedAbility
  }
}

/**
 * Check if there are any abilities with all enabled slots filled.
 * 
 * @param state 
 */
function checkForAbilityCompletion(state: WolfState, abilities: Ability[]): string | null {
  const filledSlotsResult = getfilledSlotsOnCurrentTurn(state)

  if (filledSlotsResult.length === 0) {
    return null
  }

  filledSlotsResult.forEach((filledSlot) => {
    const unfilledSlots = getUnfilledSlots(state, abilities, filledSlot.abilityName)
    if (unfilledSlots.length === 0) {
      // all slots filled in current ability.. complete
      return filledSlot.abilityName
    }
  })

  return null
}

/**
 * Find all unfilled slots in the target ability that are enabled.
 * 
 * @param state 
 * @param abilities 
 * @param focusedAbility 
 */
function getUnfilledSlots(state: WolfState, abilities: Ability[], focusedAbility: string): Slot[] {
  const ability = getTargetAbility(abilities, focusedAbility)
  if (!ability) {
    // ability is undefined - exit
    return []
  }

  const abilitySlots = ability.slots
  const slotData = getSlotData(state)
  const slotStatus = getSlotStatus(state)
  
  // return all slots that are not filled (not in slotData)
  const unfilledSlots = abilitySlots.filter((abilitySlot) => {
    return !(slotData.some((dataSlot) => dataSlot.slotName === abilitySlot.name))
  })
  
  // get all slots that are disabled
  const disabledSlots = slotStatus.filter((statusSlot) => !statusSlot.isEnabled)

  // return all slots that are not present in the disabledSlots
  const enabledSlots = unfilledSlots.filter((unfilledSlot) => {
    return !(disabledSlots.some((disabledSlot) => disabledSlot.slotName === unfilledSlot.name))
  })

  return enabledSlots
}