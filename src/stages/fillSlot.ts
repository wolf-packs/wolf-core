import { Action, Store, Dispatch } from 'redux'
import { Slot, OutputMessageItem, OutputMessageType,
  MessageData, ValidateResult, ConvoState, Ability, WolfState,
  SlotId, SlotConfirmationFunctions, SetSlotDataFunctions, Entity, PromptSlotReason } from '../types'
import { addMessage, fillSlot as fillSlotAction, startFillSlotStage,
  setFocusedAbility, removeSlotFromPromptedStack,
  confirmSlot, acceptSlot, denySlot, abilityCompleted, enableSlot,
  disableSlot, addSlotToPromptedStack } from '../actions'
import { getPromptedSlotId, isPromptStatus, isFocusedAbilitySet,
  getSlotBySlotId, getSlotTurnCount, getTargetAbility, getRequestingSlotIdFromCurrentSlotId,
    getMessageData, 
    getFocusedAbility } from '../selectors'
import { findSlotInAbilitiesBySlotId } from '../helpers'

interface PotentialSlotMatch {
  slot: Slot,
  abilityName: string,
  entity: string
}

interface MatchNotValidData extends SlotId {
  value: any
}

/**
 * FillSlot Stage (S2):
 * 
 * Find potential slots to fill based on prompt history, user message and slot states.
 * Potential slots are validated and filled by slot defined methods.
 * S2 attempts to fill current active slot that has been prompted, as well as other
 * potential slots in their the active ability or all slots.
 * 
 * @param store redux
 * @param convoState conversationState
 * @param abilities list of user defined abilities
 * 
 * @returns void
 */
export default function fillSlot(
  store: Store<WolfState>,
  convoState: ConvoState,
  abilities: Ability[]
): void {
  const { dispatch, getState } = store
  dispatch(startFillSlotStage()) // TODO: clear abilitiesCompleteOnCurrentTurn and filledSlotsOnCurrentTurn
  let potentialMatchFoundFlag: boolean = false // reset
  let slotFillFlag: boolean = false // reset
  let matchNotValid: MatchNotValidData | null = null // reset

  const message = getMessageData(getState())

  // Check if we have sent a prompt to the user in the previous turn
  if (isPromptStatus(getState())) {
    console.log('Prompted Last Turn!')
    const promptedSlotInfo = getPromptedSlotId(getState())
    const { slotName, abilityName } = promptedSlotInfo
    const promptedSlot = getSlotBySlotId(abilities, { slotName, abilityName })
    let validatorResult
    if (promptedSlot) {
      validatorResult = runSlotValidator(promptedSlot, message.rawText)
      
      if (validatorResult.isValid) {
        const fulfillSlotResult = fulfillSlot(convoState, abilities, message.rawText, slotName, abilityName, getState)
        fulfillSlotResult.forEach(dispatchActionArray(dispatch))
  
        // set slot fill flag
        slotFillFlag = true
        // remove prompted slot
        dispatch(removeSlotFromPromptedStack({slotName, abilityName}))
  
        // Original prompted slot filled.. exit
        return
      }
    }
    // Payload not valid for current slot..
    // Add reason to output queue if present
    if (validatorResult) {
      const validateMessage = createValidatorReasonMessage(validatorResult, slotName, abilityName)
      validateMessage.forEach(dispatchActionArray(dispatch))
    }
  }
  // NO PROMPT - EXPLORE OTHER SLOTS..
  
  // EXPLORE POTENTIAL MATCHES

  // set focused ability if there is none already
  if (!isFocusedAbilitySet(getState())) {
    dispatch(setFocusedAbility(message.intent))
  }

  // Check for alternative slot matches if entities present
  if (!isEntityPresent(message)) {
    // No entities exist to check for potential slot matches.. exit
    // Check if retry() is necessary before exiting
    runRetryCheck(dispatch, getState, convoState, abilities, matchNotValid, potentialMatchFoundFlag, slotFillFlag)
    return
  }

  // ENTITIES EXIST.. continue checking potential matches for each entitiy

  // CHECK FOR POTENTIAL SLOTS.. in focused ability
  const focusedAbility = getFocusedAbility(getState())
  if (focusedAbility) {
    // get ability match
    const ability = getTargetAbility(abilities, focusedAbility)

    // ensure ability has slots
    if (ability && ability.slots.length === 0) {
      dispatch(abilityCompleted(ability.name))
      return // exit stage
    }

    // ABILITY EXISTS AND HAS SLOTS TO CHECK..

    if (ability) {
      // find slot matches
      const slotMatchesFocusedAbility: PotentialSlotMatch[] = 
        getPotentialMatches(message.entities, ability)
  
      // process potential slot
      slotMatchesFocusedAbility.forEach((match) => {
        if (checkValidatorAndFill(store, convoState, abilities, match)) {
          slotFillFlag = true
          return
        }
        // validator failed
        matchNotValid = { slotName: match.slot.name, abilityName: match.abilityName, value: match.entity }
      })
    
      // Check if there are matches
      if (slotMatchesFocusedAbility.length > 0) {
        // set potential match found flag
        potentialMatchFoundFlag = true
    
        // Exit through alternative slot match route..
        // Check if retry() is necessary before exiting
        runRetryCheck(dispatch, getState, convoState, abilities, matchNotValid, potentialMatchFoundFlag, slotFillFlag)
        return
      }
      // No alternative matches found in focused ability
    }
  }

  // CHECK FOR POTENTIAL SLOTS.. in all abilities.. expanding scope
  if (message.intent) {
    // get ability match
    const ability = getTargetAbility(abilities, message.intent)

    // ensure ability has slots
    if (ability && ability.slots.length === 0) {
      dispatch(abilityCompleted(ability.name))
      return // exit stage
    }

    // ABILITY EXISTS AND HAS SLOTS TO CHECK..

    if (ability) {
      const slotMatchesAllAbility: PotentialSlotMatch[] = 
        getPotentialMatches(message.entities, ability)
    
      // process potential slot
      slotMatchesAllAbility.forEach((match) => {
        if (checkValidatorAndFill(store, convoState, abilities, match)) {
          slotFillFlag = true
          return
        }
        // validator failed
        matchNotValid = { slotName: match.slot.name, abilityName: match.abilityName, value: match.entity }
      })
    
      if (slotMatchesAllAbility.length > 0) {
        // set potential match found flag
        potentialMatchFoundFlag = true
    
        // Exit through alternative slot match route..
        // Check if retry() is necessary before exiting
        runRetryCheck(dispatch, getState, convoState, abilities, matchNotValid, potentialMatchFoundFlag, slotFillFlag)
        return
      }
      // No alternative matches found in all abilities
    }
  }
  
  // MATCHES THAT ARE VALID HAVE BEEN FILLED

  // Exit through alternative slot match route..
  // Check if retry() is necessary before exiting
  runRetryCheck(dispatch, getState, convoState, abilities, matchNotValid, potentialMatchFoundFlag, slotFillFlag)
  return
}

/**
 * Run slot onFill() and return dispatch actions to
 * add message to output queue and store the submittedValue into the pendingData state.
 */
function fulfillSlot(
  convoState: ConvoState,
  abilities: Ability[],
  message: string,
  slotName: string,
  abilityName: string,
  getState: () => WolfState
): Action[] {
  const slot = getSlotBySlotId(abilities, { slotName, abilityName })
  const actions: Action[] = []    
  if (slot) {
    const setSlotFuncs: SetSlotDataFunctions = {
      setSlotEnabled: (abilityName: string, slotName: string, isEnabled: boolean) => {
        if (isEnabled) {
          actions.push(disableSlot({slotName, abilityName}))
        } else {
          actions.push(enableSlot({slotName, abilityName}))
        }
      },
      setSlotValue: (abilityName: string, slotName: string, value: any, runOnFill?: boolean) => {
        actions.push(fillSlotAction(slotName, abilityName, value))
        if (runOnFill) {
          const targetSlot = findSlotInAbilitiesBySlotId(abilities, {abilityName, slotName})
          if (!targetSlot) {
            throw new Error('There is no slot with that name')
          }
          const setActions = fulfillSlot(convoState, abilities, value, slotName, abilityName, getState)
          actions.push(...setActions)
        }
      }
    }
    const confirmFuncs: SlotConfirmationFunctions = {
      requireConfirmation: (targetSlotName: string) => {
        actions.push(confirmSlot(
          {abilityName, slotName}, {abilityName, slotName: targetSlotName}
        ))
      },
      accept: () => {
        const originSlotId: SlotId = getRequestingSlotIdFromCurrentSlotId(getState(), {slotName, abilityName})
        actions.push(acceptSlot(originSlotId))
      },
      deny: () => {
        const originSlotId: SlotId = getRequestingSlotIdFromCurrentSlotId(getState(), {slotName, abilityName})
        actions.push(denySlot(originSlotId))
      }
    }
    const fillString = slot.onFill(message, convoState, setSlotFuncs, confirmFuncs)
    if (fillString) {
      const message: OutputMessageItem = {
        message: fillString,
        type: OutputMessageType.slotFillMessage,
        slotName: slot.name,
        abilityName: abilityName
      }
    
      // Add onFill message to output message queue
      // Add slot data to pendingData state
      actions.push(addMessage(message))
    }
    actions.push(fillSlotAction(slotName, abilityName, message))
  }
  return actions
}

/**
 * Check if slot.retry() is required on either prompted slot or newly identified slot.
 * If required, run slot retry and add retry message to output queue
 */
function runRetryCheck(
  dispatch: Dispatch,
  getState: () => WolfState,
  convoState: ConvoState,
  abilities: Ability[],
  matchNotValid: MatchNotValidData | null,
  potentialMatchFoundFlag: boolean,
  slotFillFlag: boolean
) {
  // If there has been an alternative slot match found but not been filled.. retry
  if (potentialMatchFoundFlag && !slotFillFlag && matchNotValid) {
    const matchedSlot = matchNotValid
    
    // should prompt retry on matched slot
    const retryResult = runRetry(convoState, getState, abilities, matchedSlot.slotName,
      matchedSlot.abilityName, matchedSlot.value)
    retryResult.forEach(dispatchActionArray(dispatch))

    // add slot to stack
    const slotId: SlotId = { slotName: matchedSlot.slotName, abilityName: matchedSlot.abilityName }
    dispatch(addSlotToPromptedStack(slotId, PromptSlotReason.retry))
    return
  }

  // If there was a previously prompted slot and has not been filed.. retry
  if (isPromptStatus(getState()) && !slotFillFlag) {
    const message = getMessageData(getState())
    const promptedSlotInfo = getPromptedSlotId(getState())
    const retryResult = runRetry(convoState, getState, abilities, promptedSlotInfo.slotName,
      promptedSlotInfo.abilityName, message.rawText)
    retryResult.forEach(dispatchActionArray(dispatch))

    // no need to update prompted slot.. same slot
  }

  // do not need to run retry.. exit
  return
}

/**
 * Run slot retry.
 */
function runRetry(
  convoState: ConvoState,
  getState: () => WolfState,
  abilities: Ability[],
  slotName: string,
  abilityName: string,
  submittedData: any
): Action[] {
  const slot = getSlotBySlotId(abilities, { slotName, abilityName })
  if (slot) {
    const turnCount = getSlotTurnCount(getState(), { slotName, abilityName })
    const retryMessage = slot.retry(convoState, submittedData, turnCount)
    const message: OutputMessageItem = {
      message: retryMessage,
      type: OutputMessageType.retryMessage,
      slotName: slot.name,
      abilityName: abilityName
    }
    // Add onFill message to output message queue
    return [addMessage(message)]
  }
  return []
}

/**
 * If validatorResult has a reason, create an OutputMessageItem and return addMessage() action.
 */
function createValidatorReasonMessage(
  validatorResult: ValidateResult,
  slotName: string,
  abilityName: string
): Action[] {
  if (validatorResult.reason) {
    const message =  {
      message: validatorResult.reason,
      type: OutputMessageType.validateReason,
      slotName: slotName,
      abilityName: abilityName
    }
    return [addMessage(message)]
  }
  return []
}

/**
 * For all found matches, run validator and try to fill slot.
 * For all validators that pass, fulfill slot, add message to output queue then exit.
 * For all validators that do not pass, exit.
 */
function checkValidatorAndFill (
  store: Store<WolfState>,
  convoState: ConvoState,
  abilities: Ability[],
  match: PotentialSlotMatch): boolean {
  const { dispatch, getState } = store
  const validatorResult = runSlotValidator(match.slot, match.entity)
    
  if (validatorResult.isValid) {
    const fulfillSlotResult =
      fulfillSlot(convoState, abilities, match.entity, match.slot.name, match.abilityName, getState)
    fulfillSlotResult.forEach(dispatchActionArray(dispatch))

    // slot filled.. exit true
    return true
  }
  // Payload not valid for current slot..
  // Add reason to output queue if present
  const validateMessage = createValidatorReasonMessage(validatorResult, match.slot.name, match.abilityName)
  validateMessage.forEach(dispatchActionArray(dispatch))

  // slot not filled.. exit false
  return false
}

/**
 * Dispatch on all Action items in array.
 */
const dispatchActionArray = (dispatch: Dispatch) => (action: Action): void => {
  dispatch(action)
}

/**
 * Run slot validator.
 */
function runSlotValidator(slot: Slot, submittedValue: string): ValidateResult {
  return slot.validate(submittedValue)
}

/**
 * Check if entity array contains elements.
 */
function isEntityPresent(value: MessageData) {
  if (value.entities.length > 0) {
    return true
  }
  return false
}

/**
 * For each entity, check if the `entity.name` and `ability` given matches with any slot
 * in the `abilities`
 * 
 */
function getPotentialMatches(entities: Entity[], targetAbility: Ability): PotentialSlotMatch[] {
  const slotMatches = targetAbility.slots.filter((slot) => entities.find((entity) => entity.name === slot.name))

  const matches = slotMatches.map((slot) => {
    const entityMatch = entities.find((entity) => entity.name === slot.name)
    if (entityMatch) {
      return {
        slot,
        abilityName: targetAbility.name,
        entity: entityMatch.value
      }
    }
  })

  if (typeof matches !== 'undefined') {
    return []
  }
  return matches
}
