import { PendingWolfState, Slot, SlotValidation, MessageType, Ability } from '../../types'
import { IntakeResult, Entity, NlpResult } from '../intake'
import { findAbilityByName, findSlotByEntityName } from '../../helpers'
const get = require('lodash.get')
const set = require('lodash.set')

export interface ValidateSlotsResult {
  pendingWolfState: PendingWolfState,
  validateResult: NlpResult
}

export interface FillSlotsResult extends PendingWolfState {
  
}

interface ValidatedEntity extends Entity {
  validated: SlotValidation
}

export function validateSlots(abilityDataDef: Ability[], intakeResult: IntakeResult): ValidateSlotsResult {
  const { nlpResult: result, pendingWolfState } = intakeResult
  const currentAbility = findAbilityByName(result.intent, abilityDataDef) || {name: '', slots: []} as Ability
  const { slots } = currentAbility
  // execute validators on slots
  const validatedEntities: ValidatedEntity[] = result.entities.map((entity: Entity) => {
    const slot = findSlotByEntityName(entity.entity, slots)
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
  const validatorTrue = (element: ValidatedEntity) => element.validated.valid === true  
  const entitiesWithValidValues = validatedEntities.filter(validatorTrue)

  // filter entities with invalid values: false
  const entitiesWithInvalidValues = validatedEntities.filter((entity: ValidatedEntity) => !validatorTrue(entity))

  const processInvalidEntities = (
    pendingWolfState: PendingWolfState,
    entitiesWithInvalidValues: ValidatedEntity[]
  ) : void => {
    entitiesWithInvalidValues.forEach((element) => {
      // push reason to messageQueue
      if(element.validated.reason) {
        pendingWolfState.messageQueue.push({
          message: element.validated.reason,
          type: MessageType.validateReason,
          slotName: element.entity
        })
      }
      // create waitingFor object if does not exist (retry purposes)
      if (!pendingWolfState.waitingFor.slotName) {
        pendingWolfState.waitingFor = {
          slotName: element.entity,
          turnCount: 0
        }
      }
      // run slot retry function
      const slot = findSlotByEntityName(element.entity, slots) as Slot
      if (slot.retryQuery) {
        pendingWolfState.messageQueue.push({
          message: slot.retryQuery(pendingWolfState.waitingFor.turnCount),
          type: MessageType.retryMessage,
          slotName: slot.entity
        })
      }
      pendingWolfState.waitingFor.turnCount++
    })
  }
  
  const processValidEntities = (
    pendingWolfState: PendingWolfState,
    entitiesWithValidValues: ValidatedEntity[]
  ): Entity[]  => {
    // check if any entity matches the slot wolf is waiting for
    const waitingForAnEntity = entitiesWithValidValues
      .some((entity) => entity.entity === pendingWolfState.waitingFor.slotName)

    if (waitingForAnEntity) {
      pendingWolfState.waitingFor = {
        slotName: null,
        turnCount: 0
      }
    }

    return entitiesWithValidValues.map((entity) => {
      delete entity.validated
      return entity
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

export function fillSlots(
  abilityDataDef: Ability[],
  validateSlotResult: ValidateSlotsResult
): FillSlotsResult {
  const {pendingWolfState, validateResult: result} = validateSlotResult
  const pendingPath = `pendingData.${result.intent}`
  if (! get(pendingWolfState, `pendingData.${result.intent}`)) {
    pendingWolfState.pendingData[result.intent] = {}
  }

  const setSlots = (entity: Entity) => {
    const { slots } = abilityDataDef.find(ability => ability.name === result.intent) as Ability
    const slotObj = slots.find((slot) => slot.entity === entity.entity) as Slot
    set(pendingWolfState, `pendingData.${result.intent}.${entity.entity}`, entity.value)
    pendingWolfState.messageQueue.push({
      message: slotObj.acknowledge ? slotObj.acknowledge(entity.value) : null,
      type: MessageType.slotFillMessage,
      slotName: entity.entity
    })
  }
  result.entities.forEach(setSlots)
  return pendingWolfState
}
