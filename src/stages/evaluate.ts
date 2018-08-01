import { Store } from 'redux'
import { WolfState, Ability, SlotId, Slot, PromptSlotReason } from '../types'
import { getAbilitiesCompleteOnCurrentTurn, getfilledSlotsOnCurrentTurn,
  getPromptedSlotStack, getFocusedAbility, getDefaultAbility, getSlotStatus,
  getSlotData, getTargetAbility, getAbilityStatus } from '../selectors'
import { setFocusedAbility, addSlotToPromptedStack, abilityCompleted } from '../actions'

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

  const state = getState()
  console.log('--------------------')
  console.log('beginning S3:', state)

  // Check if ability is marked to run onComplete this turn
  const abilityCompleteResult = getAbilitiesCompleteOnCurrentTurn(getState())
  if (abilityCompleteResult.length > 0) {

    // TODO: The completed ability should point to the next ability to be completed
    // Check if the next ability has been completed already
    // if no.. set the new focused ability to nextAbility and prompt a slot
    // REDO this later..
    const nextAbilityName = getNextAbility(abilities, abilityCompleteResult[0])
    if (nextAbilityName) {
      if (!isAbilityCompleted(nextAbilityName, getState)) {
        dispatch(setFocusedAbility(nextAbilityName))

        // FIND NEXT SLOT TO PROMPT IN FOCUSED ABILITY (duplicate of code below).. TODO: refactor
        const nextSlot = findNextSlotToPrompt(getState, abilities)

        if (!nextSlot) {
          dispatch(setFocusedAbility(null))
          return // no slots to prompt
        }

        // ADD SLOT TO PROMPTED STACK
        dispatch(addSlotToPromptedStack(nextSlot, PromptSlotReason.query))
        return
      }
    }

    // clear focused ability for now if next ability is completed (replace with above logic)
    dispatch(setFocusedAbility(null))

    return // exit stage.. S4 will run ability.onComplete()
  }

  // Check if there were any slots filled during this turn
  const filledSlotsResult = getfilledSlotsOnCurrentTurn(getState())
  if (filledSlotsResult.length > 0) {
    // Check if any abilities have been completed as a result of the filled slot(s)
    const abilityName = checkForAbilityCompletion(getState, abilities)
    if (abilityName) {
      // ability complete
      dispatch(abilityCompleted(abilityName))

      // TODO: The completed ability should point to the next ability to be completed
      // Check if the next ability has been completed already
      // if no.. set the new focused ability to nextAbility and prompt a slot
      // REDO this later..
      const nextAbilityName = getNextAbility(abilities, abilityName)
      if (nextAbilityName) {
        if (!isAbilityCompleted(nextAbilityName, getState)) {
          dispatch(setFocusedAbility(nextAbilityName))

          // FIND NEXT SLOT TO PROMPT IN FOCUSED ABILITY (duplicate of code below).. TODO: refactor
          const nextSlot = findNextSlotToPrompt(getState, abilities)

          if (!nextSlot) {
            dispatch(setFocusedAbility(null))
            return // no slots to prompt
          }

          // ADD SLOT TO PROMPTED STACK
          dispatch(addSlotToPromptedStack(nextSlot, PromptSlotReason.query))
          return
        }
      }

      // clear focused ability for now if next ability is completed (replace with above logic)
      dispatch(setFocusedAbility(null))

      return // exit stage.. S4 will run ability.onComplete()
    }
    // no ability has completed.. continue
  }

  // NO ABILITY TO COMPLETE THIS TURN.. check stack
  const promptedSlotStack = getPromptedSlotStack(getState())

  // Check if there are slots in the stack
  if (promptedSlotStack.length > 0) {
    // slot in the stack
    // regardless of promptSlot.prompted, exit S3
    // if prompted = false.. S4 should prompt slot
    // if prompted = true.. S4 shoudld do nothing
    return
  }

  // PROMPT STACK HAS NO ITEMS

  let focusedAbility = getFocusedAbility(getState())
  if (!focusedAbility) {
    // focusedAbility is null, use default ability
    const defaultAbility = getDefaultAbility(getState())

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

  const nextSlot = findNextSlotToPrompt(getState, abilities)

  if (!nextSlot) {
    return // no slots to prompt
  }

  // ADD SLOT TO PROMPTED STACK
  dispatch(addSlotToPromptedStack(nextSlot, PromptSlotReason.query))
  return
}

/**
 * Find the next enabled and pending slot in the `focusedAbility` to be prompted
 */
function findNextSlotToPrompt(getState: () => WolfState, abilities: Ability[]): SlotId | null {
  const focusedAbility = getFocusedAbility(getState())
  if (!focusedAbility) {
    return null
  }

  const enabledSlots = getUnfilledSlots(getState, abilities, focusedAbility)

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
 */
function checkForAbilityCompletion(getState: () => WolfState, abilities: Ability[]): string | null {
  // const filledSlotsResult = getfilledSlotsOnCurrentTurn(getState())

  // if (filledSlotsResult.length === 0) {
  //   return null
  // }
  // const {slotStatus} = getState()

  // let result = null
  // filledSlotsResult.forEach((filledSlot) => {
  //   const unfilledSlots = getUnfilledSlots(getState, abilities, filledSlot.abilityName)
  //   if (unfilledSlots.length === 0) {
  //     // all slots filled in current ability.. complete
  //     result = filledSlot.abilityName
  //   }
  // })

  const {focusedAbility, slotStatus} = getState()
  const ability = abilities.find(_ => _.name === focusedAbility)
  if (!ability) {
    return null
  }
  const focusedSlotStatus = slotStatus.filter(_ => _.abilityName === ability.name)
  const isEveryAbilitySlotInSlotStatus = ability.slots
    .every(_ => !!focusedSlotStatus.find(status => status.slotName === _.name))
  if (!isEveryAbilitySlotInSlotStatus) {
    return null
  }

  const isEveryEnabledSlotStatusDone = slotStatus
    .filter(_ => _.isEnabled)
    .every(_ => _.isDone)

  if (!isEveryEnabledSlotStatusDone) {
    return null
  }
  return ability.name
}

/**
 * Find all unfilled slots in the target ability that are enabled. 
 */
function getUnfilledSlots(getState: () => WolfState, abilities: Ability[], focusedAbility: string): Slot[] {
  const ability = getTargetAbility(abilities, focusedAbility)
  if (!ability) {
    // ability is undefined - exit
    return []
  }

  const abilitySlots = ability.slots
  const slotData = getSlotData(getState())
  const slotStatus = getSlotStatus(getState())
  
  // return all slots that are not filled (not in slotData)
  const unfilledSlots = abilitySlots.filter((abilitySlot) => {
    return !slotData.find(slot => slot.abilityName === ability.name && slot.slotName === abilitySlot.name)
    // return !(slotData.some((dataSlot) => dataSlot.slotName === abilitySlot.name))
  })
  
  // get all slots that are disabled
  const disabledSlots = slotStatus.filter((statusSlot) => !statusSlot.isEnabled)

  // return all slots that are not present in the disabledSlots
  const enabledSlots = unfilledSlots.filter((unfilledSlot) => {
    return !disabledSlots.find(
      disabledSlot => disabledSlot.abilityName === ability.name && disabledSlot.slotName === unfilledSlot.name)
    // return !(disabledSlots.some((disabledSlot) => disabledSlot.slotName === unfilledSlot.name))
  })

  return enabledSlots
}

function getNextAbility (abilities: Ability[], abilityName: string): string | undefined {
  const completedAbility = getTargetAbility(abilities, abilityName)

  if (completedAbility && completedAbility.nextAbility) {
    const nextAbility = getTargetAbility(abilities, completedAbility.nextAbility)
    
    if (nextAbility) {
      return nextAbility.name
    }
  }
}

function isAbilityCompleted (abilityName: string, getState: () => WolfState): boolean {
  const abilityStatus = getAbilityStatus(getState())

  return abilityStatus.some((ability) => ability.abilityName === abilityName && ability.isCompleted)
}

// function getNextUncompleteAbility (abilities: Ability[], getState: () => WolfState) {
//   const abilityStatus = getAbilityStatus(getState())

//   // get uncomplete abilities
//   const uncompleteAbilities = abilities.filter((ability) => abilityStatus.some((statusAbility) => {
//     return !(statusAbility.abilityName === ability.name && statusAbility.isCompleted)
//   })

// }
