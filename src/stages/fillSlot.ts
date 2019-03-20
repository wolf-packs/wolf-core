import { Action, Store, Dispatch } from 'redux'
import {
  Slot, OutputMessageItem, OutputMessageType,
  MessageData, ValidateResult, Ability, WolfState,
  SlotId, SlotConfirmationFunctions, SetSlotDataFunctions, Entity, PromptSlotReason,
  Flow
} from '../types'
import {
  addMessage, fillSlot as fillSlotAction, startFillSlotStage,
  setFocusedAbility, removeSlotFromPromptedStack,
  acceptSlot, denySlot, abilityCompleted, enableSlot,
  disableSlot, addSlotToPromptedStack, reqConfirmSlot,
  incrementTurnCountBySlotId, setSlotPrompted, setSlotDone, removeSlotFromOnFillStack
} from '../actions'
import {
  getPromptedSlotId, isPromptStatus, isFocusedAbilitySet,
  getSlotTurnCount, getRequestingSlotIdFromCurrentSlotId,
  getMessageData, getFocusedAbility, getDefaultAbility, getRunOnFillStack,
  getFilledSlotsOnCurrentTurn
} from '../selectors'
import { doesAbilityHaveSlots, getSlotByName, getAbilityByName } from '../helpers'
const logState = require('debug')('wolf:s2:enterState')
const log = require('debug')('wolf:s2')

interface PotentialSlotMatch<G> {
  slot: Slot<G>,
  abilityName: string,
  entity: string
}

interface MatchNotValidData extends SlotId {
  value: any
}

const hasSlotBeenFilledThisStage = (filledArray: SlotId[], slotId: SlotId): boolean => {
  const { slotName, abilityName } = slotId
  return filledArray
    .findIndex(_ => _.slotName === slotName && _.abilityName === abilityName) > -1
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
 * @param convoStorageLayer conversationState storage layer
 * @param abilities list of user defined abilities
 * 
 * @returns void
 */
export default async function fillSlot<T, G>(
  store: Store<WolfState>,
  convoStorageLayer: G,
  flow: Flow<T, G>
): Promise<void> {
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

  /**
   * save validator fail reason for prompted slot
   */
  let promptedSlotReason: ValidateResult | null = null

  const message = getMessageData(getState())
  logState(getState())

  const { slots, abilities } = flow

  log('first wolf checks to see if there is anything in the runOnFillStack')
  const runOnFillStack = getRunOnFillStack(getState())
  if (runOnFillStack) {
    for (const onFillStackItem of runOnFillStack) {
      const { slotName, abilityName, message } = onFillStackItem
      const actions: Action[] = await fulfillSlot(
        convoStorageLayer,
        flow,
        message,
        slotName,
        abilityName,
        getState
      )
      actions.forEach(dispatch)
      dispatch(removeSlotFromOnFillStack({ slotName, abilityName }))
    }
  }

  // Check if we have sent a prompt to the user in the previous turn
  if (isPromptStatus(getState())) {
    log('was prompted previous turn')
    const promptedSlotInfo = getPromptedSlotId(getState())
    const { slotName, abilityName } = promptedSlotInfo
    log('%s on %s was prompted', slotName, abilityName)
    const promptedSlot = getSlotByName(slots, slotName)
    let validatorResult
    if (promptedSlot) {
      if (message.rawText) {
        log('user said: %s', message.rawText)

        const slotEntity = message.entities.find(x => (x.name === slotName))
        const slotValue = (slotEntity ? slotEntity.value : message.rawText)

        // if slotEntity is defined, run validator and onFill on slotEntity.value
        // if there are no entities or slotEntity is undefined, run validator and onFill on message.rawText
        if (slotEntity || message.entities.length === 0) {
          validatorResult = await runSlotValidator(convoStorageLayer, promptedSlot, slotValue, message)

          if (validatorResult.isValid) {
            log('users response was valid according to the prompted slots validator')
            const fulfillSlotResult = await fulfillSlot(
              convoStorageLayer,
              flow,
              slotValue,
              slotName,
              abilityName,
              getState
            )
            fulfillSlotResult.forEach(dispatch)
            log('so fulfill the slot by running these actions: %O', fulfillSlotResult)

            // add to slotFillArr
            slotFillArr.push({ slotName, abilityName })

            // remove prompted slot
            dispatch(removeSlotFromPromptedStack({ slotName, abilityName }))

            if (message.entities.length <= 1) {
              log('Because one or none entity is detected. No more slots to fill...exiting stage')
              // Because one entity is detected. No more slots to fill.... exit
              return Promise.resolve()
            }
          }
        }

          // Payload not valid for current slot..
          // Do not add reason to output queue yet.. identified entity may fill this slot later in stage
          // Save validator reason to create output message if necessary later in stage
          promptedSlotReason = validatorResult || null
          matchNotValid = { slotName, abilityName, value: message.rawText }
          log('in runRetryCheck().., matchNotValid: %O,'
    , matchNotValid)
        
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
    const ability = getAbilityByName(abilities, focusedAbility)
    // ensure ability has slots which are represented in abilities as traces
    if (ability && !doesAbilityHaveSlots<T, G>(ability)) {
      log('the focused ability has no slots, marking it completed, and exit stage')
      // no slots in ability.. should be completed
      dispatch(abilityCompleted(ability.name))
      return Promise.resolve() // exit stage
    }
    log('focused ability has slots, continuing')
  }
  // SLOTS EXIST ON FOCUSED ABILITY..

  // Check for alternative slot matches if entities present
  if (!isEntityPresent(message)) {
    log('there is no entities from messageData')
    // No entities exist to check for potential slot matches.. exit
    // Check if retry() is necessary before exiting
    runRetryCheck(
      dispatch,
      getState,
      convoStorageLayer,
      flow,
      matchNotValid,
      potentialMatchFoundFlag,
      slotFillArr
    )

    // check if original prompt failed validation and has not been filled by entities matched
    if (promptedSlotReason) {
      tryPromptedSlotValidatorMessage(dispatch, getState, promptedSlotReason)
    }

    log('finished running "runRetryCheck", exit stage')
    return Promise.resolve()
  }

  log('there is at least one entity from message Data')
  // ENTITIES EXIST.. continue checking potential matches for each entity

  // CHECK FOR POTENTIAL SLOTS.. in focused ability  
  if (focusedAbility) {
    log('starting to look for potential matches in %s which is the focused ability', focusedAbility)
    // get ability match
    const ability = getAbilityByName(abilities, focusedAbility)
    // ABILITY EXISTS AND HAS SLOTS TO CHECK..
    if (ability) {
      log('%s ability Found in abilities.ts', ability.name)
      // find slot matches
      const slotMatchesFocusedAbility: PotentialSlotMatch<G>[] =
        getPotentialMatches(message.entities, ability, slots)
      log('potential slot matches found: %o', slotMatchesFocusedAbility)

      // process potential slot
      for (const match of slotMatchesFocusedAbility) {
        const checkValidFillResult = await checkValidatorAndFill(store, convoStorageLayer, flow, match)
        if (checkValidFillResult) {
          log('match valid and filled for %s', checkValidFillResult.slotName)
          // add to slotFillArr
          slotFillArr.push({ slotName: checkValidFillResult.slotName, abilityName: checkValidFillResult.abilityName })

          log('slot match verified and filled.. moving to next potential match if available.')
          continue
        }
        log('match is not valid for %s', match.slot.name)
        // validator failed
        matchNotValid = { slotName: match.slot.name, abilityName: match.abilityName, value: match.entity }
      }

      log('All matches, if any have been checked (validate and filled).')

      // Check if there are matches
      if (slotMatchesFocusedAbility.length > 0) {
        log('%s matched in focused ability!', slotMatchesFocusedAbility.map(_ => _.slot.name).join(', '))
        // set potential match found flag
        potentialMatchFoundFlag = true

        // Exit through alternative slot match route..
        // Check if retry() is necessary before exiting
        log('checking to see if retry is necessary in retry')
        runRetryCheck(
          dispatch,
          getState,
          convoStorageLayer,
          flow,
          matchNotValid,
          potentialMatchFoundFlag,
          slotFillArr
        )

        // check if original prompt failed validation and has not been filled by entities matched
        if (promptedSlotReason) {
          tryPromptedSlotValidatorMessage(dispatch, getState, promptedSlotReason)
        }

        log('checked retry, now exiting')
        return Promise.resolve()
      }
      // No alternative matches found in focused ability
    }
  }

  log('there was no slots matched on focused ability, so checking all abilities for potential matches')
  // CHECK FOR POTENTIAL SLOTS.. in all abilities.. expanding scope
  if (message.intent) {
    log('there is intent in the messageData')
    // get ability match
    const ability = getAbilityByName(abilities, message.intent)

    // ensure ability has slots
    if (ability && !doesAbilityHaveSlots<T, G>(ability)) {
      log('ability is found, but there is no slots on the ability.')
      dispatch(abilityCompleted(ability.name))

      // check if original prompt failed validation and has not been filled by entities matched
      if (promptedSlotReason) {
        tryPromptedSlotValidatorMessage(dispatch, getState, promptedSlotReason)
      }

      log('exiting')
      return Promise.resolve() // exit stage
    }

    // ABILITY EXISTS AND HAS SLOTS TO CHECK..
    if (ability) {
      log('ability match found and there are slots to check for matches')
      const slotMatchesAllAbility: PotentialSlotMatch<G>[] =
        getPotentialMatches(message.entities, ability, slots)

      // process potential slot
      log('slot matched on the ability: %s', slotMatchesAllAbility.map(_ => _.slot.name).join(', '))
      log('running the validator on them and filling the slot')
      for (const match of slotMatchesAllAbility) {
        const checkValAndFillResult = await checkValidatorAndFill(store, convoStorageLayer, flow, match)
        if (checkValAndFillResult) {
          log('match valid and filled for %s', checkValAndFillResult.slotName)
          // add to slotFillArr
          slotFillArr.push({ slotName: checkValAndFillResult.slotName, abilityName: checkValAndFillResult.abilityName })

          log('slot match verified and filled.. moving to next potential match if available.')
          continue
        }
        log('match is not valid for %s', match.slot.name)
        // validator failed
        matchNotValid = { slotName: match.slot.name, abilityName: match.abilityName, value: match.entity }
      }

      log('done validating and filling the slots')
      if (slotMatchesAllAbility.length > 0) {
        log('found slot matches, so setting the potentialmatchFoundFlag to true')
        // set potential match found flag
        potentialMatchFoundFlag = true
        log('running Retry Check')
        // Exit through alternative slot match route..
        // Check if retry() is necessary before exiting
        runRetryCheck(
          dispatch,
          getState,
          convoStorageLayer,
          flow,
          matchNotValid,
          potentialMatchFoundFlag,
          slotFillArr
        )

        // check if original prompt failed validation and has not been filled by entities matched
        if (promptedSlotReason) {
          tryPromptedSlotValidatorMessage(dispatch, getState, promptedSlotReason)
        }
        log('exiting stage')
        return Promise.resolve()
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
  runRetryCheck(
    dispatch,
    getState,
    convoStorageLayer,
    flow,
    matchNotValid,
    potentialMatchFoundFlag,
    slotFillArr
  )

  // check if original prompt failed validation and has not been filled by entities matched
  if (promptedSlotReason) {
    tryPromptedSlotValidatorMessage(dispatch, getState, promptedSlotReason)
  }
  log('exit stage')
  return Promise.resolve()
}

/**
 * Run slot onFill() and return dispatch actions to
 * add message to output queue and store the submittedValue into the pendingData state.
 */
export async function fulfillSlot<T, G>(
  convoStorageLayer: G,
  flow: Flow<T, G>,
  slotValue: any,
  slotName: string,
  abilityName: string,
  getState: () => WolfState,
  shouldDispatchOnFillMessage: boolean = true
): Promise<Action[]> {
  const { slots, abilities } = flow
  log('in fulfillSlot()..')
  const slot = getSlotByName(slots, slotName)
  const actions: Action[] = []
  if (slot) {
    log('%O, slot exists:', slot)
    const setSlotFuncs: SetSlotDataFunctions = {
      setSlotEnabled: (abilityName: string, slotName: string, isEnabled: boolean) => {
        if (isEnabled) {
          actions.push(disableSlot({ slotName, abilityName }))
        } else {
          actions.push(enableSlot({ slotName, abilityName }))
        }
      },
      setSlotValue: async (abilityName: string, slotName: string, value: any, runOnFill?: boolean) => {
        actions.push(fillSlotAction(slotName, abilityName, value))
        if (runOnFill) {
          const targetSlot = getSlotByName(slots, slotName)
          if (!targetSlot) {
            throw new Error('There is no slot with that name')
          }
          const setActions = await fulfillSlot(
            convoStorageLayer,
            flow,
            value,
            slotName,
            abilityName,
            getState
          )
          actions.push(...setActions)
        }
      },
      setSlotDone: (abilityName: string, slotName: string, isDone: boolean) => {
        actions.push(setSlotDone({ slotName, abilityName }, isDone))
      },
      fulfillSlot: async (abilityName: string, slotName: string, value: any) => {
        // Similar implementation 
        actions.push(fillSlotAction(slotName, abilityName, value))
        const targetSlot = getSlotByName(slots, slotName)
        if (!targetSlot) {
          throw new Error('There is no slot with that name')
        }
        const setActions = await fulfillSlot(
          convoStorageLayer,
          flow,
          value,
          slotName,
          abilityName,
          getState
        )
        actions.push(...setActions)
      }
    }
    const confirmFuncs: SlotConfirmationFunctions = {
      requireConfirmation: (targetSlotName: string) => {
        actions.push(reqConfirmSlot(
          { abilityName, slotName }, { abilityName, slotName: targetSlotName }
        ))
      },
      accept: () => {
        const originSlotId: SlotId = getRequestingSlotIdFromCurrentSlotId(getState(), { slotName, abilityName })
        actions.push(acceptSlot(originSlotId))
      },
      deny: () => {
        const originSlotId: SlotId = getRequestingSlotIdFromCurrentSlotId(getState(), { slotName, abilityName })
        actions.push(denySlot(originSlotId))
        actions.push(addSlotToPromptedStack(originSlotId, PromptSlotReason.query))
        // actions.push(removeSlotData({ slotName, abilityName }))
      }
    }
    actions.push(fillSlotAction(slotName, abilityName, slotValue))
    if (slot.onFill) {
      log('slot.onFill exists.. run slot.onFill()')
      const onFillMessage = await slot.onFill(slotValue, convoStorageLayer, setSlotFuncs, confirmFuncs)
      actions.push(removeSlotFromOnFillStack({ slotName, abilityName }))

      if (shouldDispatchOnFillMessage) {
        if (onFillMessage) {
          log('slot.onFill() return string: %s', onFillMessage)
          const message: OutputMessageItem = {
            message: onFillMessage,
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
    // remove prompted slot from stack
    const promptedSlotId = getPromptedSlotId(getState())
    if (promptedSlotId) {
      const { slotName: promptedSlotName, abilityName: promptedAbilityName } = promptedSlotId
      if (slotName === promptedSlotName && abilityName === promptedAbilityName) {
        actions.push(removeSlotFromPromptedStack(promptedSlotId))
      }
    }
  }
  log('exiting fulfillSlot()..')
  return Promise.resolve(actions)
}

/**
 * Check if slot.retry() is required on either prompted slot or newly identified slot.
 * If required, run slot retry and add retry message to output queue
 */
async function runRetryCheck<T, G>(
  dispatch: Dispatch,
  getState: () => WolfState,
  convoStorageLayer: G,
  flow: Flow<T, G>,
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

  const { slotName, abilityName, value } = matchNotValid
  const hasSlotBeenFilled: boolean = hasSlotBeenFilledThisStage(slotFillArr, { slotName, abilityName })

  if (hasSlotBeenFilled) {
    log('slot: %s on %s has been filled, so exiting runRetryCheck...', slotName, abilityName)
    return
  }

  if (potentialMatchFoundFlag) {
    log('alternative slot has been found but not filled.. run retry on %s, %s',
      slotName, abilityName)

    // should prompt retry on matched 
    dispatch(incrementTurnCountBySlotId({ slotName, abilityName }))
    const retryResult = await runRetry(convoStorageLayer, getState, flow, slotName, abilityName, value)
    retryResult.forEach(dispatch)

    log('adding %s slot to stack', slotName)
    // add slot to stack
    const slotId: SlotId = { slotName: slotName, abilityName: abilityName }
    dispatch(addSlotToPromptedStack(slotId, PromptSlotReason.retry))
    dispatch(setSlotPrompted(slotId, false))

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
    const retryResult = await runRetry(convoStorageLayer, getState, flow, promptedSlotInfo.slotName,
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
async function runRetry<T, G>(
  convoStorageLayer: G,
  getState: () => WolfState,
  flow: Flow<T, G>,
  slotName: string,
  abilityName: string,
  submittedValue: any
): Promise<Action[]> {
  log('in runRetry()..')
  const { slots } = flow
  const slot = getSlotByName(slots, slotName)
  log('getting slot: %s', slot)
  if (slot) {
    log('slot exists run slot.retry()')
    const turnCount = getSlotTurnCount(getState(), { slotName, abilityName })

    // Check if slot has a retry function defined
    let retryMessage = '' // Default to empty string
    if (slot.retry) {
      retryMessage = await slot.retry(submittedValue, convoStorageLayer, turnCount)
    }
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
      setSlotPrompted({ slotName, abilityName }, true)
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
    const message = {
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
async function checkValidatorAndFill<T, G>(
  store: Store<WolfState>,
  convoStorageLayer: G,
  flow: Flow<T, G>,
  match: PotentialSlotMatch<G>
): Promise<SlotId | null> {
  log('in checkValidatorAndFill()..')
  const { dispatch, getState } = store
  const validatorResult = await runSlotValidator(
    convoStorageLayer,
    match.slot,
    match.entity,
    getMessageData(getState())
  )

  log('validatorResult.isValid: %s', validatorResult.isValid)
  if (validatorResult.isValid) {
    log('isValid is true.. fulfillSlot')
    const fulfillSlotResult =
      await fulfillSlot(
        convoStorageLayer,
        flow,
        match.entity,
        match.slot.name,
        match.abilityName,
        getState
      )
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
async function runSlotValidator<G>(
  convoStorageLayer: G,
  slot: Slot<G>,
  submittedValue: any,
  messageData: MessageData
): Promise<ValidateResult> {
  if (!slot.validate) {
    // Default to true validation if no validation function is defined
    return {
      isValid: true,
      reason: null
    }
  }
  return await slot.validate(submittedValue, convoStorageLayer, messageData)
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
function getPotentialMatches<T, G>(
  entities: Entity[], targetAbility: Ability<T, G>, slots: Slot<G>[]
): PotentialSlotMatch<G>[] {
  const traceMatches = targetAbility.traces.filter((trace) => entities.find((entity) => entity.name === trace.slotName))

  const matches = traceMatches.map((trace) => {
    const entityMatch = entities.find((entity) => entity.name === trace.slotName)
    const slot = getSlotByName(slots, trace.slotName)
    if (entityMatch) {
      return {
        slot,
        abilityName: targetAbility.name,
        entity: entityMatch.value
      }
    }
  }).filter(_ => _) as PotentialSlotMatch<G>[]

  if (matches.length === 0) {
    return []
  }

  return matches
}

function tryPromptedSlotValidatorMessage(
  dispatch: Dispatch,
  getState: () => WolfState,
  validatorResult: ValidateResult
): void {
  // Check if original prompt has been filled

  const promptedSlotId = getPromptedSlotId(getState())
  if (!promptedSlotId) {
    return
  }
  const { slotName, abilityName } = promptedSlotId
  const slotsFilledArr = getFilledSlotsOnCurrentTurn(getState())
  const isOriginalSlotFilled = slotsFilledArr.some(_ => _.slotName === slotName && _.abilityName === abilityName)

  if (isOriginalSlotFilled) {
    // original prompt filled, do not send validator result message
    return
  }

  // Add reason to output queue if present
  log('users response was not valid.. creating the validator message')
  const validateMessage = createValidatorReasonMessage(validatorResult, slotName, abilityName)
  validateMessage.forEach(dispatch)
}