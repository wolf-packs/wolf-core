import { Action, Store, Dispatch } from 'redux'
import { Slot, OutputMessageItem, OutputMessageType, MessageData, ValidateResult } from '../types'
import { addMessage, setMessageData } from '../actions'
import { ConvoState } from '../types/old_types';
import { addMessageToQueue } from '../helpers';

interface PotentialSlotMatch {
  slot: Slot,
  entity: string
}

const setSlotPendingData = (payload: string): Action<any> => { return }
const addSlotToStack = (slotName: string): Action<any> => { return }
const setActiveAbility = (abilityName: string): Action<any> => { return }
const setSlotFillFlag = (value: boolean): Action<any> => { return }

const submittedData = 'kevin'

/**
 * FillSlot Stage (S2):
 * 
 * Find potential slots to fill based on prompt history, user message and slot states.
 * Potential slots are validated and filled by slot defined methods.
 * S2 attempts to fill current active slot that has been prompted, as well as other
 * potential slots in their the active ability or all slots.
 * 
 * @param dispatch redux
 * @param convoState conversationState
 * 
 * @returns void
 */
export default function fillSlot({dispatch}: Store, convoState: ConvoState): void {
  let potentialMatchFoundFlag: boolean = false

  const message: MessageData = getMessageData

  // Check if we have sent a prompt to the user in the previous turn
  if (isPromptStatus()) {
    const slot = getPromptedSlot()

    const validatorResult = runSlotValiadtor(slot, message.rawText)
    
    if (validatorResult.isValid) {
      const fulfillSlotResult = fulfillSlot(convoState, slot, message.rawText)
      fulfillSlotResult.forEach(dispatchActionArray(dispatch))

      // set slot fill flag
      dispatch(setSlotFillFlag(true))

      // Original prompted slot filled.. exit
      return // Status: FILLED
    }
    // Payload not valid for current slot..
    // Add reason to output queue if present
    const validateMessage = createValidatorReasonMessage(validatorResult, slot)
    validateMessage.forEach(dispatchActionArray(dispatch))
  }
  // NO PROMPT - EXPLORE OTHER SLOTS..
  
  // EXPLORE POTENTIAL MATCHES

  // set active ability if there is none already
  if (!isActiveAbilitySet()) {
    if (message.intent) {
      dispatch(setActiveAbility(message.intent))
    }
  }

  // Check for alternative slot matches if entities present
  if (!isEntityPresent(message)) {
    // No entities exist to check for potential slot matches.. exit
    // Check if retry() is necessary before exiting
    runRetryCheck(dispatch, potentialMatchFoundFlag)
    return
  }

  // ENTITIES EXIST.. continue checking potential matches for each entitiy

  // CHECK FOR POTENTIAL SLOTS.. in active ability
  const slotMatchesActiveAbility: PotentialSlotMatch[] = checkActiveAbilityMatches()
  // process potential slot
  slotMatchesActiveAbility.forEach(checkValidatorAndFill(convoState, dispatch))

  // Check if there are matches
  if (slotMatchesActiveAbility.length > 0) {
    // set potential match found flag
    potentialMatchFoundFlag = true

    // Exit through alternative slot match route..
    // Check if retry() is necessary before exiting
    runRetryCheck(dispatch, potentialMatchFoundFlag)
    return
  }
  // No alternative matches found in active ability

  // CHECK FOR POTENTIAL SLOTS.. in all abilities.. expanding scope
  const slotMatchesAllAbility: PotentialSlotMatch[] = checkAllAbilityMatches()
  // process potential slot
  slotMatchesAllAbility.forEach(checkValidatorAndFill(convoState, dispatch))
  
  if (slotMatchesAllAbility.length > 0) {
    // set potential match found flag
    potentialMatchFoundFlag = true

    // Exit through alternative slot match route..
    // Check if retry() is necessary before exiting
    runRetryCheck(dispatch, potentialMatchFoundFlag)
    return
  }
  // No alternative matches found in all abilities
  
  // MATCHES THAT ARE VALID HAVE BEEN FILLED
    
  // Exit through alternative slot match route..
  // Check if retry() is necessary before exiting
  runRetryCheck(dispatch, potentialMatchFoundFlag)
  return
}

/**
 * Run slot onFill() and return dispatch actions to
 * add message to output queue and store the submittedValue into the pendingData state.
 */
function fulfillSlot(convoState: ConvoState, slot: Slot, message: string): Action[] {
  const fillString = slot.onFill(message, convoState, setSlotFuncs, confirmFuncs)
  if (fillString) {
    const message: OutputMessageItem = {
      message: fillString,
      type: OutputMessageType.slotFillMessage,
      slotName: slot.name,
      abilityName: getSlotAbilityName(slot.name)
    }
  
    // Add onFill message to output message queue
    // Add slot data to pendingData state
    return [addMessage(message), setSlotPendingData(submittedData)]
  }
  return []
}

/**
 * Check if slot.retry() is required on either prompted slot or newly identified slot.
 * If required, run slot retry and add retry message to output queue
 */
function runRetryCheck(dispatch: Dispatch, potentialMatchFoundFlag: boolean) {
  // TODO get slotFillFlag
  const slotFillFlag: boolean = true // todo

  // If there has been an alternative slot match found but not been filled.. retry
  if (potentialMatchFoundFlag && !slotFillFlag) {
    // should prompt retry on this matched slot
    // TODO get active slot
    let matchedSlot: Slot = {}
    const retryResult = runRetry(matchedSlot)
    retryResult.forEach(dispatchActionArray(dispatch))
    return
  }

  // If there was a previously prompted slot and has not been filed.. retry
  if (isPromptStatus() && !slotFillFlag) {
    const promptedSlot = getPromptedSlot()
    const retryResult = runRetry(promptedSlot)
    retryResult.forEach(dispatchActionArray(dispatch))
  }

  // do not need to run retry.. exit
  return
}

/**
 * Run slot retry.
 * 
 * @param slot Slot to be retried.
 * 
 * @returns addMessage Action.
 */
function runRetry(slot: Slot): Action[] {
  const retryMessage = slot.retry()
  const message: OutputMessageItem = {
    message: retryMessage,
    type: OutputMessageType.retryMessage,
    slotName: slot.name,
    abilityName: getSlotAbility(slot.name)
  }
  // Add onFill message to output message queue
  return [addMessage(message)]
}

/**
 * If validatorResult has a reason, create an OutputMessageItem and return addMessage() action.
 */
function createValidatorReasonMessage(validatorResult: ValidateResult, slot: Slot): Action[] {
  if (validatorResult.reason) {
    const message =  {
      message: validatorResult.reason,
      type: OutputMessageType.validateReason,
      slotName: slot.name,
      abilityName: getSlotAbilityName(slot.name)
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
const checkValidatorAndFill = (convoState: ConvoState, dispatch: Dispatch) => (match: PotentialSlotMatch): void => {
  const validatorResult = runSlotValiadtor(match.slot, match.entity)
    
  if (validatorResult.isValid) {
    const fulfillSlotResult = fulfillSlot(convoState, match.slot, match.entity)
    fulfillSlotResult.forEach(dispatchActionArray(dispatch))

    // set slot fill flag
    dispatch(setSlotFillFlag(true))

    // slot filled.. exit
    return // Status: FILLED
  }
  // Payload not valid for current slot..
  // Add reason to output queue if present
  const validateMessage = createValidatorReasonMessage(validatorResult, match.slot)
  validateMessage.forEach(dispatchActionArray(dispatch))
}

/**
 * Dispatch on all Action items in array.
 */
const dispatchActionArray = (dispatch: Dispatch) => (action: Action): void => {
  dispatch(action)
}

/**
 * Check if we have prompted the user for a specific slot.
 * Ex. Ran slot.query() on the previous turn
 */
function isPromptStatus(): boolean {
  // TODO
  // Prompted -> return true
  // Not prompted -> retunr false
  return true
}

/**
 * Return previously prompted slot object.
 */
function getPromptedSlot(): Slot {
  // TODO
  // promptedSlot = getSlotByName
  return promptedSlot
}

/**
 * Return previously prompted slot ability name.
 */
function getSlotAbilityName(slotName: string): string {
  // TODO return prompted slot's ability
  const promptedAbilityName = 'test'
  return promptedAbilityName
}

/**
 * Run slot validator.
 */
function runSlotValiadtor(slot: Slot, submittedValue: string): ValidateResult {
  return slot.validate(submittedValue)
}

/**
 * Check if active ability is set
 */
function isActiveAbilitySet(): boolean {
  // TODO check if active ability is set
  return true
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
 * For each entity, check if the entity.name matches any slot.name in the active ability.
 */
function checkActiveAbilityMatches(): PotentialSlotMatch[] {
  // TODO
  return
}

/**
 * For each entity, check if the `entity.name` and `message.intent` matches any
 * slot in any ability. `message.intent` will be used to determine the ability to check.
 */
function checkAllAbilityMatches(): PotentialSlotMatch[] {
  return
}
