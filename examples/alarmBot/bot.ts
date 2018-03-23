import { Bot, MemoryStorage, BotStateManager } from 'botbuilder'
import { BotFrameworkAdapter } from 'botbuilder-services'
import * as wolf from '../../src'
import nlp, { NlpResult, Entity } from './nlp'
import {findAbilityByName, findSlotByEntityName} from './helpers'

// import difference from 'lodash.difference'

import * as addAlarm from './addAlarm'
import * as removeAlarm from './removeAlarm'
import * as listAlarms from './listAlarms'
import * as listAbilities from './listAbilities'

const ksl = {
  addAlarm,
  removeAlarm,
  listAlarms,
  listAbilities
}

import abilityList from './abilities'

const get = require('lodash.get')
const set = require('lodash.set')
const difference = require('lodash.difference')
const restify = require('restify')

// Create server
let server = restify.createServer()
server.listen(process.env.port || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`)
})

// Create connector
const adapter = new BotFrameworkAdapter(
  { appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD }
)

server.post('/api/messages', adapter.listen())

interface SlotValidation {
  valid: boolean,
  reason?: string
}

export interface Slot {
  entity: string,
  query: string,
  type: string,
  retryQuery?: (turnCount: number) => string,
  validate?: (value: string) => SlotValidation
  acknowledge?: (value: any) => string
}

export interface Ability { // Topic or SGroup
  name: string,
  slots: Slot[]
}

interface PendingWolfState extends WolfState {

}

interface IntakeResult {
  pendingWolfState: PendingWolfState,
  nlpResult: NlpResult
}

interface ValidateSlotsResult {
  pendingWolfState: PendingWolfState,
  validateResult: NlpResult
}

interface FillSlotsResult extends PendingWolfState {
  
}

interface EvaluateResult {
  pendingWolfState: PendingWolfState,
  type: string, // 'slot' 'userAction'
  name: string,
}

interface ActionResult extends PendingWolfState {

}

type OuttakeResult = void

const abilities: Ability[] = abilityList

interface WaitingFor {
  slotName: string | null,
  turnCount: number, // initial = 0
}

enum MessageType {
  validateReason,
  retryMessage,
  queryMessage,
  slotFillMessage,
  abilityMessage
}

interface MessageQueueItem {
  message: string,
  type: MessageType,
  slotName?: string,
  abilityName?: string
}

interface WolfState {
  activeAbility: string, //addAlarm
  waitingFor: WaitingFor,
  messageQueue: MessageQueueItem[],
  pendingData: {
    [key: string]: any 
    // addAlarm: {
    //   alarmName: "wakeup"
    //   alarmTime: "6am"
    // }
  }
}

interface State {
  wolf: WolfState
}

interface getStateFunctionGeneric {
  (): any
}

interface getStateFunctions {
  getBotState: getStateFunctionGeneric,
  getSgState?: getStateFunctionGeneric,
  getSubmittedData: getStateFunctionGeneric
}

// type Action = (result: NlpResult, state: WolfState, next: () => Action) => void

function getActiveAbility(defaultAbility: string, activeAbility: string | undefined, intent: string | undefined)
: string {
  if (activeAbility) {
    return activeAbility
  }
  return intent ? intent : defaultAbility
}

function intake(wolfState: PendingWolfState, message: string): IntakeResult {
  const pendingWolfState = Object.assign({}, wolfState)
  const activeAbility: string = pendingWolfState.activeAbility as string
  let nlpResult: NlpResult
  if (pendingWolfState.waitingFor.slotName) { // bot asked for a question
    nlpResult = {
      intent: activeAbility,
      entities: [
        {
          entity: pendingWolfState.waitingFor.slotName,
          value: message,
          string: message
        }
      ]
    }
    // return intakeResult
  } else {
    nlpResult = nlp(message)
  }
  
  const newActiveAbility = getActiveAbility('listAlarms', activeAbility, nlpResult.intent)
  const pendingWithNewActiveAbility = Object.assign({}, pendingWolfState, {activeAbility: newActiveAbility})
  return {
    pendingWolfState: pendingWithNewActiveAbility,
    nlpResult
  }
}

interface ValidatedEntity extends Entity {
  validated: SlotValidation
}

interface ValidatedEntitiesResult {
  validResults: ValidatedEntity[], 
  invalidResults: ValidatedEntity[]
}

type ValidateEntities = (entities: Entity[]) => ValidatedEntitiesResult

function validateSlots(intakeResult: IntakeResult): ValidateSlotsResult {
  const {nlpResult: result, pendingWolfState} = intakeResult
  const currentAbility = findAbilityByName(result.intent, abilityList)
  const {slots} = currentAbility
  // execute validators on slots
  const validatedEntities: ValidatedEntity[] = result.entities.map((entity: Entity) => {
    const slot = findSlotByEntityName(entity.entity, slots)
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

  const processInvalidEntities = (pendingWolfState: PendingWolfState, entitiesWithInvalidValues: ValidatedEntity[]) : void => {
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
      const slot = findSlotByEntityName(element.entity, slots)
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
  
  const processValidEntities = (pendingWolfState: PendingWolfState, entitiesWithValidValues): Entity[]  => {
    // check if any entity matches the slot wolf is waiting for
    const waitingForAnEntity = entitiesWithValidValues.some((entity) => entity.entity === pendingWolfState.waitingFor.slotName)
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

function fillSlots(validateSlotResult: ValidateSlotsResult): FillSlotsResult {
  const {pendingWolfState, validateResult: result} = validateSlotResult
  const pendingPath = `pendingData.${result.intent}`
  if (! get(pendingWolfState, `pendingData.${result.intent}`)) {
    pendingWolfState.pendingData[result.intent] = {}
  }

  const setSlots = (entity: Entity) => {
    const {slots} = abilities.find(ability => ability.name === result.intent)
    const slotObj = slots.find((slot) => slot.entity === entity.entity)
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

function evaluate(result: FillSlotsResult): EvaluateResult {
  // simplest non-graph implementation
  const pendingWolfState = result
  const {activeAbility, pendingData} = pendingWolfState
  const abilityObj = abilities.find((ability) => ability.name === activeAbility)
  const currentPendingData = pendingData[activeAbility]
  const missingSlots = difference(abilityObj.slots.map(slot => slot.entity), Object.keys(currentPendingData))
  if (missingSlots.length === 0) { // no missingSlot
    const completedObj = ksl[activeAbility]
    pendingWolfState.activeAbility = null
    return {
      pendingWolfState,
      type: 'userAction',
      name: activeAbility
    }
  } 

  const {slots} = abilityObj
  const pendingSlot = slots.find(slot => slot.entity === missingSlots[0])
  return {
    pendingWolfState,
    type: 'slot',
    name: pendingSlot.entity
  }
}

function action(state: BotState, result: EvaluateResult): ActionResult {
  const { pendingWolfState } = result
  if (result.type === 'slot') {
    const {slots} = abilities.find((ability) => ability.name === pendingWolfState.activeAbility)
    const slot = slots.find((slot) => slot.entity === result.name)

    if (!pendingWolfState.waitingFor.slotName) {
      pendingWolfState.waitingFor = {
        slotName: slot.entity,
        turnCount: 0
      }
      pendingWolfState.messageQueue.push({
        message: slot.query,
        type: MessageType.queryMessage,
        slotName: slot.entity
      })
    }
    return pendingWolfState
  }
  
  if (result.type === 'userAction') {
    const ability = abilities.find((ability) => ability.name === result.name)
    const userAction = ksl[ability.name]
    const data = pendingWolfState.pendingData[ability.name]
    
    const ackObj: getStateFunctions = {
      getBotState: () => state,  // user defined
      getSubmittedData: () => data
    }

    if (userAction.props && userAction.props.name) {
      const prev = state.conversation[userAction.props.name]
      state.conversation[userAction.props.name] = userAction.submit(prev, data)
      ackObj.getSgState = () => state.conversation[userAction.props.name]
    }

    pendingWolfState.messageQueue.push({
      message: userAction.acknowledge(ackObj),
      type: MessageType.abilityMessage,
      abilityName: ability.name
    })

    // remove pendingData
    pendingWolfState.activeAbility = null
    pendingWolfState.pendingData[ability.name] = undefined
    return pendingWolfState
  }
}

function outtake(convoState: {[key: string]: any}, reply, result: ActionResult): OuttakeResult {
  const pendingWolfState = result
  // order and format messageQueue
  // slotFillMessage  "I have captured x, y, z..."
  // abilityMessage   "I have completed ability x, y, z..."
  // validateReason   "Reasons for retry messages"
  // retryMessage     "retry x, y, z..."

  const createMessage = (messageQueue, messageType) => {
    const queue = messageQueue.filter(message => message.type === messageType)
    const messages = `${queue.map(_ => _.message).join(', ')}`
    return messages
  }

  const slotFillMessage = createMessage(pendingWolfState.messageQueue, MessageType.slotFillMessage)
  const abilityMessage = createMessage(pendingWolfState.messageQueue, MessageType.abilityMessage)
  const validateMessage = createMessage(pendingWolfState.messageQueue, MessageType.validateReason)
  const retryMessage = createMessage(pendingWolfState.messageQueue, MessageType.retryMessage)
  
  // display messageQueue
  if (slotFillMessage) {
    reply(slotFillMessage)
  }
  if (abilityMessage) {
    reply(abilityMessage)
  }
  if (validateMessage) {
    reply(validateMessage)
  }
  if (retryMessage) {
    reply(retryMessage)
  }
  
  pendingWolfState.messageQueue = []
  
  // update wolfState with pendingWolfState
  convoState.wolf = pendingWolfState
}

new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .use({
      contextCreated: (context: BotContext, next) => {
        const conversationState = context.state.conversation
        
        if (conversationState && conversationState.wolf) {
          return next()
        }

        if (!conversationState) {
          context.state.conversation = {}
        }

        context.state.conversation.wolf = {
          activeAbility: null,
          waitingFor: {
            slotName: null,
            turnCount: 0
          },
          messageQueue: [],
          pendingData: {},
          // intake: null,
          // actions: [],
          // outtake: null,
          data: {}
        }
        
        return next()
      }
    })
    .onReceive((context: BotContext) => {
      try {
        if (context.request.type !== 'message') {
          return
        }

        const message = context.request.text

        // Intake
        const intakeResult: IntakeResult = intake(context.state.conversation.wolf, message)

        // FillSlot
        const validatedResults: ValidateSlotsResult = validateSlots(intakeResult)
        const pendingWolfState: FillSlotsResult = fillSlots(validatedResults)

        // Evaluate
        const evaluateResult: EvaluateResult = evaluate(pendingWolfState)
        
        // Action
        const actionResult: ActionResult = action(context.state, evaluateResult)

        // Outtake
        outtake(context.state.conversation, context.reply.bind(context), actionResult)

      } catch (err) {
        console.error(err)
      }
    })
