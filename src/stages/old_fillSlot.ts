import { PendingWolfState, Slot, SlotValidation, MessageType, Ability } from '../types'
import { IntakeResult, NlpEntity, NlpResult } from './old_intake'
import { findAbilityByName, findSlotByEntityName } from '../helpers'
const get = require('lodash.get')
const set = require('lodash.set')

export interface ValidateSlotsResult {
  pendingWolfState: PendingWolfState,
  validateResult: NlpResult
}

export interface FillSlotsResult extends PendingWolfState {
  
}

interface ValidatedEntity extends NlpEntity {
  validated: SlotValidation
}

export function validateSlots(
  abilityDataDef: Ability[],
  intakeResult: IntakeResult,
  nlpResult: NlpResult
): ValidateSlotsResult {
  const pendingWolfState = intakeResult
  let result: NlpResult = nlpResult
  const activeAbility = pendingWolfState.activeAbility
  const currentAbility = findAbilityByName(activeAbility, abilityDataDef) || {name: '', slots: []} as Ability
  const { slots } = currentAbility

  if (pendingWolfState.isWaitingSlot) { // bot asked for a question.. waiting for specific slot
    result = pendingWolfState.waitingSlotData
  }

  // execute validators on slot
  const validatedEntities: ValidatedEntity[] = result.entities.map((entity: NlpEntity) => {
    const slot = findSlotByEntityName(entity.name, slots)
    if (!slot) {
      return {
        ...entity,
        validated: {
          valid: false,
          reason: 'sorry the slot info is not in the current ability.  contact the developer'
        }
      }
    }
    if (!slot.validate) {
      return {
        ...entity,
        validated: {
          valid: true
        }
      }
    }
    const result = slot.validate(entity.value)
    return {
      ...entity,
      validated: result
    }
  })
  
  // filter entities with valid values: true && no validator
  const validatorTrue = (valEntity: ValidatedEntity) => valEntity.validated.valid === true  
  const entitiesWithValidValues = validatedEntities.filter(validatorTrue)

  // filter entities with invalid values: false
  const entitiesWithInvalidValues = validatedEntities.filter((valEntity: ValidatedEntity) => !validatorTrue(valEntity))

  const processInvalidEntities = (
    pendingWolfState: PendingWolfState,
    entitiesWithInvalidValues: ValidatedEntity[]
  ): void => {
    entitiesWithInvalidValues.forEach((invalEntity) => {
      // push reason to messageQueue
      if (invalEntity.validated.reason) {
        pendingWolfState.messageQueue.push({
          message: invalEntity.validated.reason,
          type: MessageType.validateReason,
          slotName: invalEntity.name
        })
      }
      
      // run slot retry function
      const slot = findSlotByEntityName(invalEntity.name, slots) as Slot
      if (slot.retry) {
        pendingWolfState.messageQueue.push({
          message: slot.retry(pendingWolfState.waitingSlot.turnCount),
          type: MessageType.retryMessage,
          slotName: slot.name
        })
      }
      pendingWolfState.waitingSlot.turnCount++
    })
  }
  
  const processValidEntities = (
    pendingWolfState: PendingWolfState,
    entitiesWithValidValues: ValidatedEntity[]
  ): NlpEntity[]  => {
     
    // check if any entity matches the slot wolf is waiting for
    const waitingForAnEntity = entitiesWithValidValues
      .some((entity) => entity.name === pendingWolfState.waitingSlot.slotName)
  
    // pendingWolfState is no longer waiting, slow will be filled
    if (waitingForAnEntity) {
      pendingWolfState.waitingSlot = {
        slotName: null,
        turnCount: 0
      }
    }

    return entitiesWithValidValues.map((valEntity) => {
      delete valEntity.validated
      return valEntity
    })
  }
  
  processInvalidEntities(pendingWolfState, entitiesWithInvalidValues)
  const validEntities = processValidEntities(pendingWolfState, entitiesWithValidValues)
  return {
    pendingWolfState,
    validateResult: {
      intent: result.intent,
      entities: validEntities
    }
  }
}

export default function fillSlots(
  abilityDataDef: Ability[],
  validateSlotResult: ValidateSlotsResult
): FillSlotsResult {
  const { pendingWolfState, validateResult: result } = validateSlotResult
  const pendingPath = `pendingData.${result.intent}`

  if (typeof result.intent === 'undefined') {
    return pendingWolfState
  }

  // initialize ability specific pending data object
  if (! get(pendingWolfState, pendingPath)) {
    pendingWolfState.pendingData[result.intent] = {}
  }
  
  const setSlots = (entity: NlpEntity) => {
    const { slots } = abilityDataDef.find(ability => ability.name === result.intent) as Ability
    const slotObj = slots.find((slot) => slot.name === entity.name) as Slot
    set(pendingWolfState, `pendingData.${result.intent}.${entity.name}`, entity.value)

    // slot filled, change to idle state
    pendingWolfState.isWaitingSlot = false
    
    // add onFill message to messageQueue
    // message will default to null, filter out null in outtake
    pendingWolfState.messageQueue.push({
      message: slotObj.onFill ? slotObj.onFill(entity.value) : null,
      type: MessageType.slotFillMessage,
      slotName: entity.name
    })
  }
  result.entities.forEach(setSlots)
  return pendingWolfState
}
