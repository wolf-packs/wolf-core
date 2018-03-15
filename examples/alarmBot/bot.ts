import { Bot, MemoryStorage, BotStateManager } from 'botbuilder'
import { BotFrameworkAdapter } from 'botbuilder-services'
import * as wolf from '../../src'
import nlp, { NlpResult } from './nlp'

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
  acknowledge?: (value: any) => string
}

interface Ability { // Topic or SGroup
  name: string,
  slots: Slot[]
}

interface IntakeResult extends NlpResult {

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
  waitingFor: string, //addAlarm.alarmTime
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
          entity: wolfState.waitingFor,
          value: message,
          string: message
        }
      ]
    }
    wolfState.waitingFor = null

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

function runActions(reply, actions) {
  actions.forEach((action) => {
    const message = action()
    if (message) {
      reply(message)
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
    state.conversation.wolf.waitingFor = slot.entity
    reply(slot.query)
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

    reply(userAction.acknowledge(ackObj))
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
        const actions = getActions(wolfState, intakeResult) // [('path', value) => string, ]
        runActions(context.reply.bind(context), actions)

        // Evaluate
        const evaluateResult: EvaluateResult = evaluate(context.state.conversation, wolfState)
        
        // Outtake
        outtake(context.state, context.reply.bind(context), evaluateResult)

      } catch (err) {
        console.error(err)
      }
    })
 