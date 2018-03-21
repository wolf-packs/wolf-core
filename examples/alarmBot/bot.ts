import { Bot, MemoryStorage, BotStateManager } from 'botbuilder'
import { BotFrameworkAdapter } from 'botbuilder-services'
import * as wolf from '../../src'
import nlp, { NlpResult, Entity } from './nlp'

import difference from 'lodash.difference'

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

interface Slot {
  entity: string,
  query: string,
  type: string,
  retryQuery?: (turnCount: number) => string,
  validate?: (value: string) => { valid: boolean, reason?: string } 
  acknowledge?: (value: any) => string
}

interface Ability { // Topic or SGroup
  name: string,
  slots: Slot[]
}

interface IntakeResult extends NlpResult {

}

interface ValidateResult {
  intent: string,
  entities: Entity[],
  wolfPendingState: Object
}

interface EvaluateResult {
  type: string,
  name: string,
  activeAbility: string
}

const abilities: Ability[] = abilityList

// interface Outtake {
//   type: 'slot' | 'submit',

//   funcs?: Object
// }

interface WolfState {
  activeAbility: string, //addAlarm
  waitingFor: {
    slotName: string,
    turnCount: number,
  },
  messageQueue: string[],
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

function intake(wolfState: WolfState, message: string): IntakeResult {
  let intakeResult: IntakeResult
  if (wolfState.waitingFor) { // bot asked for a question
    // set(wolfState.pendingData, wolfState.waitingFor, message ) // validator => extractor
    intakeResult = {
      intent: wolfState.activeAbility,
      entities: [
        {
          entity: wolfState.waitingFor.slotName,
          value: message,
          string: message
        }
      ]
    }
    return intakeResult
  } 
  
  const nlpObj = nlp(message)
  if (nlpObj.intent) {
  
    if (!wolfState.activeAbility) {
      wolfState.activeAbility = nlpObj.intent
    }

    intakeResult = nlpObj
  } else {
    // no nlp intent found
    // must specify a starting/goto ability such as 'listActivities' or 'did not understand'
    // user defined handle
    nlpObj.intent = 'listAbilities'
    wolfState.activeAbility = nlpObj.intent
    intakeResult = nlpObj
  }
  return intakeResult
}

function validateSlots(wolfState: WolfState, result: IntakeResult) {
  const validateResult: ValidateResult = {
    intent: result.intent,
    entities: [],
    wolfPendingState: {}
  }

  const {slots} = abilities.find(ability => ability.name === result.intent)

  // filter slots with no validator to pass through
  const hasNoValidator = (element: Entity) => !(slots.find((slot) => slot.entity === element.entity).validate)
  const entitiesWithoutValidators = result.entities.filter(hasNoValidator)
  // check if any entity matches the slot wolf is waiting for
  if (wolfState.waitingFor) {
    const entityMatch = entitiesWithoutValidators.find((entity) => entity.entity === wolfState.waitingFor.slotName)
    if(entityMatch) {
      wolfState.waitingFor = null
    }
  }

  // filter slots with validators to execute
  const hasValidator = (element: Entity) => slots.find((slot) => slot.entity === element.entity).validate
  let entitiesWithValidators = result.entities.filter(hasValidator)
  const executeValidators = (element: Entity) => {
    const slotObj = slots.find((slot) => slot.entity === element.entity)
    
    let validateResult = slotObj.validate(element.value)
    
    // valid: false
    if(!validateResult.valid) {
      // push reason to messageQueue
      if(validateResult.reason) {
        wolfState.messageQueue.push(validateResult.reason)
      }
      // create waitingFor object if does not exist (retry purposes)
      if (!wolfState.waitingFor) {
        wolfState.waitingFor = {
          slotName: slotObj.entity,
          turnCount: 0
        }
      }
      // run slot retry function
      if (slotObj.retryQuery) {
        wolfState.messageQueue.push(slotObj.retryQuery(wolfState.waitingFor.turnCount))
      }
      wolfState.waitingFor.turnCount++
      return undefined
    }

    // validator is true
    wolfState.waitingFor = null
    return {
      entity: element.entity,
      value: element.value,
      string: element.string
    }
  }
  entitiesWithValidators = entitiesWithValidators.map(executeValidators).filter((element) => element)
  validateResult.entities = [...entitiesWithoutValidators, ...entitiesWithValidators]
  return validateResult
}

function getActions(wolfState: WolfState, result: IntakeResult) {
  const pendingPath = `pendingData.${result.intent}`
  if (! get(wolfState, `pendingData.${result.intent}`)) {
    wolfState.pendingData[result.intent] = {}
  }

  return result.entities.map(entity => {
    const {slots} = abilities.find(ability => ability.name === result.intent)
    const slotObj = slots.find((slot) => slot.entity === entity.entity)
    return () => {
      set(wolfState, `pendingData.${result.intent}.${entity.entity}`, entity.value)
      
      return slotObj.acknowledge? slotObj.acknowledge(entity.value) : null
    }
  })
}

function runActions(wolfState, reply, actions) {
  actions.forEach((action) => {
    const message = action()
    if (message) {
      wolfState.messageQueue.push(message)
    }
  })
}

function evaluate(convoState: Object, wolfState: WolfState) {
  // simplest non-graph implementation
  const {activeAbility, pendingData} = wolfState
  const abilityObj = abilities.find((ability) => ability.name === activeAbility)
  const currentPendingData = pendingData[activeAbility]
  const missingSlots = difference(abilityObj.slots.map(slot => slot.entity), Object.keys(currentPendingData))
  if (missingSlots.length === 0) { // no missingSlot
    const completedObj = ksl[activeAbility]
    wolfState.activeAbility = null
    return {
      type: 'userAction',
      name: activeAbility,
      activeAbility
    }
  } 

  const {slots} = abilityObj
  const pendingSlot = slots.find(slot => slot.entity === missingSlots[0])
  return {
    type: 'slot',
    name: pendingSlot.entity,
    activeAbility
  }
}

function outtake(state: BotState, reply, result: EvaluateResult) {
  if (result.type === 'slot') {
    const {slots} = abilities.find((ability) => ability.name === result.activeAbility)
    const slot = slots.find((slot) => slot.entity === result.name)

    if (!state.conversation.wolf.waitingFor) {
      state.conversation.wolf.waitingFor = {
        slotName: slot.entity,
        turnCount: 0
      }
      state.conversation.wolf.messageQueue.push(slot.query)
    }

    state.conversation.wolf.messageQueue.forEach(element => {
      reply(element)
    })
    state.conversation.wolf.messageQueue = []
    return
  }
  
  if (result.type === 'userAction') {
    const ability = abilities.find((ability) => ability.name === result.name)
    const userAction = ksl[ability.name]
    const data = state.conversation.wolf.pendingData[ability.name]
    
    const ackObj: getStateFunctions = {
      getBotState: () => state,  // user defined
      getSubmittedData: () => data
    }

    if (userAction.props && userAction.props.name) {
      const prev = state.conversation[userAction.props.name]
      state.conversation[userAction.props.name] = userAction.submit(prev, data)
      ackObj.getSgState = () => state.conversation[userAction.props.name]
    }

    state.conversation.wolf.messageQueue.push(userAction.acknowledge(ackObj))
    state.conversation.wolf.messageQueue.forEach(element => {
      reply(element)
    })
    state.conversation.wolf.messageQueue = []

    // remove pendingData
    state.conversation.wolf.activeAbility = null
    state.conversation.wolf.pendingData[ability.name] = undefined
  }
  // state.conversation = mutate() // returns the state
  // reply(replyText())
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
          waitingFor: null,
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
        const wolfState: WolfState = context.state.conversation.wolf

        // Intake
        const intakeResult: IntakeResult = intake(wolfState, message)

        // Actions
        const validatedResults = validateSlots(wolfState, intakeResult)
        const actions = getActions(wolfState, validatedResults) // [('path', value) => string, ]
        runActions(wolfState, context.reply.bind(context), actions)

        // Evaluate
        const evaluateResult: EvaluateResult = evaluate(context.state.conversation, wolfState)
        
        // Outtake
        outtake(context.state, context.reply.bind(context), evaluateResult)

      } catch (err) {
        console.error(err)
      }
    })
