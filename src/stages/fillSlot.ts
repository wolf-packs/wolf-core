import { Action, Store, Dispatch } from 'redux'
import { Slot, OutputMessageItem, OutputMessageType,
  MessageData, ValidateResult, ConvoState, Ability, WolfState,
  SlotId, SlotConfirmationFunctions, SetSlotDataFunctions, Entity, PromptSlotReason } from '../types'
import { addMessage, fillSlot as fillSlotAction, startFillSlotStage,
  setFocusedAbility, removeSlotFromPromptedStack,
  acceptSlot, denySlot, abilityCompleted, enableSlot,
  disableSlot, addSlotToPromptedStack, reqConfirmSlot, incrementTurnCountBySlotId, setSlotPrompted } from '../actions'
import { getPromptedSlotId, isPromptStatus, isFocusedAbilitySet,
  getSlotBySlotId, getSlotTurnCount, getTargetAbility, getRequestingSlotIdFromCurrentSlotId,
  getMessageData, getFocusedAbility, getDefaultAbility } from '../selectors'
import { findSlotInAbilitiesBySlotId } from '../helpers'
const logState = require('debug')('wolf:s2:enterState')
const log = require('debug')('wolf:s2')

interface PotentialSlotMatch {
  slot: Slot,
  abilityName: string,
  entity: string
}

interface MatchNotValidData extends SlotId {
  value: any
}

const hasSlotBeenFilledThisStage = (filledArray: SlotId[], slotId: SlotId): boolean => {
  const {slotName, abilityName} = slotId
  return filledArray
    .findIndex(_ => _.slotName === slotName && _.abilityName === abilityName ) > -1
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
  dispatch(startFillSlotStage()) // clear abilitiesCompleteOnCurrentTurn and filledSlotsOnCurrentTurn
  /**
   * keeps track if a slot match has been found for an entity
   * either in focused or all ability
   */
  let potentialMatchFoundFlag: boolean = false
  
  /**
   * keep track of all slots that have been filled this stage
   */
  let slotFillArr: SlotId[] = []
  
  /**
   * matched slot that fails validation during stage
   */
  let matchNotValid: MatchNotValidData | null = null

  const message = getMessageData(getState())
  logState(getState())
  // Check if we have sent a prompt to the user in the previous turn
  if (isPromptStatus(getState())) {
    log('was prompted previous turn')
    const promptedSlotInfo = getPromptedSlotId(getState())
    const { slotName, abilityName } = promptedSlotInfo
    log('%s on %s was prompted', slotName, abilityName)
    const promptedSlot = getSlotBySlotId(abilities, { slotName, abilityName })
    let validatorResult
    if (promptedSlot) {
      if (message.rawText) {
        log('user said: %s', message.rawText)
        validatorResult = runSlotValidator(promptedSlot, message.rawText, message)
        
        if (validatorResult.isValid) {
          log('users response was valid according to the prompted slots validator')
          const fulfillSlotResult = fulfillSlot(convoState, abilities, message.rawText, slotName, abilityName, getState)
          fulfillSlotResult.forEach(dispatch)
          log('so fulfill the slot by running these actions: %O', fulfillSlotResult)
                    
          // add to slotFillArr
          slotFillArr.push({ slotName, abilityName })
          
          // remove prompted slot
          dispatch(removeSlotFromPromptedStack({slotName, abilityName}))
          log('exiting stage')
          // Original prompted slot filled.. exit
          return
        }
        // Payload not valid for current slot..
        // Add reason to output queue if present
        log('users response was not valid.. creating the validator message')
        const validateMessage = createValidatorReasonMessage(validatorResult, slotName, abilityName)
        validateMessage.forEach(dispatch)
        matchNotValid = {slotName, abilityName, value: message.rawText}
      }
    }
  }
  // EXPLORE OTHER SLOTS FOR POTENTIAL MATCHES

  // set focused ability if there is none already
  if (!isFocusedAbilitySet(getState())) {
    log('focused ability is not set, so ...')
    const msgIntent = message.intent ? message.intent : getDefaultAbility(getState())
    log('setting it to %s', msgIntent)
    dispatch(setFocusedAbility(msgIntent))
  }
  // Check if focused ability has any slots to check
  const focusedAbility = getFocusedAbility(getState())

  if (focusedAbility) {
    log('there is a focused ability, %s', focusedAbility)
    const ability = getTargetAbility(abilities, focusedAbility)
    // ensure ability has slots
    if (ability && ability.slots.length === 0) {
      log('the focused ability has no slots, marking it completed, and exit stage')
      // no slots in ability.. should be completed
      dispatch(abilityCompleted(ability.name))
      return // exit stage
    }
    log('focused ability has slots, continuing')
  }
  // SLOTS EXIST ON FOCUSED ABILITY..

  // Check for alternative slot matches if entities present
  if (!isEntityPresent(message)) {
    log('there is no entities from messageData')
    // No entities exist to check for potential slot matches.. exit
    // Check if retry() is necessary before exiting
    runRetryCheck(dispatch, getState, convoState, abilities, matchNotValid, potentialMatchFoundFlag, slotFillArr)
    log('finished running "runRetryCheck", exit stage')
    return
  }

  log('there is at least one entity from message Data')
  // ENTITIES EXIST.. continue checking potential matches for each entity
  
  // CHECK FOR POTENTIAL SLOTS.. in focused ability  
  if (focusedAbility) {
    log('starting to look for potential matches in %s which is the focused ability', focusedAbility)
    // get ability match
    const ability = getTargetAbility(abilities, focusedAbility)
    // ABILITY EXISTS AND HAS SLOTS TO CHECK..
    if (ability) {
      log('%s ability Found in abilities.ts', ability.name)
      // find slot matches
      const slotMatchesFocusedAbility: PotentialSlotMatch[] = 
        getPotentialMatches(message.entities, ability)
      
      // process potential slot
      slotMatchesFocusedAbility.forEach((match) => {
        const checkValandFillResult = checkValidatorAndFill(store, convoState, abilities, match)
        if (checkValandFillResult) {
          log('match valid and filled for %s', checkValandFillResult.slotName)
          // add to slotFillArr
          slotFillArr.push({ slotName: checkValandFillResult.slotName, abilityName: checkValandFillResult.abilityName })

          log('exiting stage')
          return
        }
        log('match is not valid for %s', match.slot.name)
        // validator failed
        matchNotValid = { slotName: match.slot.name, abilityName: match.abilityName, value: match.entity }
      })
    
      // Check if there are matches
      if (slotMatchesFocusedAbility.length > 0) {
        log('%s matched in focused ability!', slotMatchesFocusedAbility.map(_ => _.slot.name).join(', '))
        // set potential match found flag
        potentialMatchFoundFlag = true
    
        // Exit through alternative slot match route..
        // Check if retry() is necessary before exiting
        log('checking to see if retry is necessary in retry')
        runRetryCheck(dispatch, getState, convoState, abilities, matchNotValid, potentialMatchFoundFlag, slotFillArr)
        log('checked retry, now exiting')
        return
      }
      // No alternative matches found in focused ability
    }
  }

  log('there was no slots matched on focused ability, so checking all abilities for potential matches')
  // CHECK FOR POTENTIAL SLOTS.. in all abilities.. expanding scope
  if (message.intent) {
    log('there is intent in the messageData')
    // get ability match
    const ability = getTargetAbility(abilities, message.intent)

    // ensure ability has slots
    if (ability && ability.slots.length === 0) {
      log('ability is found, but there is no slots on the ability.')
      dispatch(abilityCompleted(ability.name))
      log('exiting')
      return // exit stage
    }

    // ABILITY EXISTS AND HAS SLOTS TO CHECK..
    if (ability) {
      log('ability match found and there are slots to check for matches')
      const slotMatchesAllAbility: PotentialSlotMatch[] = 
        getPotentialMatches(message.entities, ability)
    
      // process potential slot
      log('slot matched on the ability: %s', slotMatchesAllAbility.map(_ => _.slot.name).join(', '))
      log('running the validator on them and filling the slot')
      slotMatchesAllAbility.forEach((match) => {
        const checkValandFillResult = checkValidatorAndFill(store, convoState, abilities, match)
        if (checkValandFillResult) {
          log('match valid and filled for %s', checkValandFillResult.slotName)          
          // add to slotFillArr
          slotFillArr.push({ slotName: checkValandFillResult.slotName, abilityName: checkValandFillResult.abilityName })

          log('exiting stage')
          return
        }
        log('match is not valid for %s', match.slot.name)
        // validator failed
        matchNotValid = { slotName: match.slot.name, abilityName: match.abilityName, value: match.entity }
      })
      log('done validating and filling the slots')
      if (slotMatchesAllAbility.length > 0) {
        log('found slot matches, so setting the potentialmatchFoundFlag to true')
        // set potential match found flag
        potentialMatchFoundFlag = true
        log('running Retry Check')
        // Exit through alternative slot match route..
        // Check if retry() is necessary before exiting
        runRetryCheck(dispatch, getState, convoState, abilities, matchNotValid, potentialMatchFoundFlag, slotFillArr)
        log('exiting stage')
        return
      }
      // No alternative matches found in all abilities
    }
    log('ability was not found from the message intent, so the intent on messageData does not exist in abilities.ts')
  }
  
  // MATCHES THAT ARE VALID HAVE BEEN FILLED
  log('matches that are valid should have been all filled now')
  // Exit through alternative slot match route..
  // Check if retry() is necessary before exiting
  log('check to see if any not valid slots needs to run retry')
  runRetryCheck(dispatch, getState, convoState, abilities, matchNotValid, potentialMatchFoundFlag, slotFillArr)
  log('exit stage')
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
  log('in fulfillSlot()..')
  const slot = getSlotBySlotId(abilities, { slotName, abilityName })
  const actions: Action[] = []    
  if (slot) {
    log('%O, slot exists:', slot)
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
        actions.push(reqConfirmSlot(
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
        actions.push(addSlotToPromptedStack(originSlotId, PromptSlotReason.query))
        // actions.push(removeSlotData({ slotName, abilityName }))
      }
    }
    actions.push(fillSlotAction(slotName, abilityName, message))
    if (slot.onFill) {
      log('slot.onFill exists.. run slot.onFill()')      
      const fillString = slot.onFill(message, convoState, setSlotFuncs, confirmFuncs)
      if (fillString) {
        log('slot.onFill() return string: %s', fillString)                
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
    } 
  }
  log('exiting fulfillSlot()..')
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
  slotFillArr: SlotId[]
) {
  log('in runRetryCheck().., matchNotValid: %O, potentialMatch: %s, slotFill: %O'
    , matchNotValid, potentialMatchFoundFlag, slotFillArr)
  // If there has been an alternative slot match found but not been filled.. retry
  log('checking if there are alternative slot matches that have not been filled..')
  if (matchNotValid === null) {
    return
  }

  const {slotName, abilityName, value} = matchNotValid
  const hasSlotBeenFilled: boolean = hasSlotBeenFilledThisStage(slotFillArr, {slotName, abilityName})
  
  if (hasSlotBeenFilled) {
    log('slot: %s on %s has been filled, so exiting runRetryCheck...', slotName, abilityName)
    return
  }

  if (potentialMatchFoundFlag) {
    log('alternative slot has been found but not filled.. run retry on %s, %s', 
      slotName,  abilityName)
    
    // should prompt retry on matched 
    dispatch(incrementTurnCountBySlotId({ slotName, abilityName }))
    const retryResult = runRetry(convoState, getState, abilities, slotName, abilityName, value)
    retryResult.forEach(dispatch)

    log('adding %s slot to stack', slotName)
    // add slot to stack
    const slotId: SlotId = { slotName: slotName, abilityName: abilityName }
    dispatch(addSlotToPromptedStack(slotId, PromptSlotReason.retry))
    
    log('exiting runRetryCheck()..')
    return
  }
  log('no alternative slot matches to run retry..')
  log('check if there is a previously prompted slot that has not been filled..')
  // If there was a previously prompted slot and has not been filed.. retry
  // TODO CHECK SLOTFILLARR HERE
  if (isPromptStatus(getState())) {
    const message = getMessageData(getState())
    const promptedSlotInfo = getPromptedSlotId(getState())
    log('run retry on %s', promptedSlotInfo.slotName)
    dispatch(incrementTurnCountBySlotId({ slotName, abilityName }))
    const retryResult = runRetry(convoState, getState, abilities, promptedSlotInfo.slotName,
      promptedSlotInfo.abilityName, message.rawText)
    retryResult.forEach(dispatch)

    // no need to update prompted slot.. same slot
    log('exiting runRetryCheck()..')
    return
  }
  log('no previously prompted slot to run retry..')
  // do not need to run retry.. exit
  log('exiting runRetryCheck()..')
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
  log('in runRetry()..')
  const slot = getSlotBySlotId(abilities, { slotName, abilityName })
  log('getting slot: %s', slot)
  if (slot) {
    log('slot exists run slot.retry()')
    const turnCount = getSlotTurnCount(getState(), { slotName, abilityName })
    const retryMessage = slot.retry(convoState, submittedData, turnCount)
    const message: OutputMessageItem = {
      message: retryMessage,
      type: OutputMessageType.retryMessage,
      slotName: slot.name,
      abilityName: abilityName
    }
    // Add onFill message to output message queue
    // Increment retry turn count
    log('retry message string: %s', message.message)
    log('exiting runRetry()..')
    return [
      addMessage(message),
      setSlotPrompted({slotName, abilityName}, true)
    ]
  }
  log('exiting runRetry()..')
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
  match: PotentialSlotMatch): SlotId | null {
  log('in checkValidatorAndFill()..')
  const { dispatch, getState } = store  
  const validatorResult = runSlotValidator(match.slot, match.entity, getMessageData(getState()))
  
  log('validatorResult.isValid: %s', validatorResult.isValid)  
  if (validatorResult.isValid) {
    log('isValid is true.. fulfillSlot')
    const fulfillSlotResult =
      fulfillSlot(convoState, abilities, match.entity, match.slot.name, match.abilityName, getState)
    fulfillSlotResult.forEach(dispatch)

    // slot filled.. exit true
    log('exiting checkValidatorAndFill with true')
    return { slotName: match.slot.name, abilityName: match.abilityName }
  }
  // Payload not valid for current slot..
  // Add reason to output queue if present
  log('isValid is false.. create validator message')
  const validateMessage = createValidatorReasonMessage(validatorResult, match.slot.name, match.abilityName)
  validateMessage.forEach(dispatch)

  // slot not filled.. exit false
  log('exiting checkValidatorAndFill with false')
  return null
}

/**
 * Run slot validator.
 */
function runSlotValidator(slot: Slot, submittedData: any, messageData: MessageData): ValidateResult {
  if (!slot.validate) {
    return {
      isValid: true,
      reason: null
    }
  }
  return slot.validate(submittedData, messageData)
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
  }).filter(_ => _) as PotentialSlotMatch[]

  if (matches.length === 0) {
    return []
  }

  return matches
}
