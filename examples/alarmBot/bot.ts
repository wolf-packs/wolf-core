import { BotFrameworkAdapter, MemoryStorage, ConversationState, Activity } from 'botbuilder'
// import { BotFrameworkAdapter } from 'botbuilder-services'
import nlp from './nlp'

// import * as wolf from '../../src'
import intake, { NlpResult, Entity } from '../../src/stages/intake'
import { validateSlots, fillSlots, ValidateSlotsResult, FillSlotsResult } from '../../src/stages/fillSlot'
import evaluate, { EvaluateResult } from '../../src/stages/evaluate'
import action, { ActionResult } from '../../src/stages/actions'
import outtake from '../../src/stages/outtake'

// import Wolf middleware
import initializeWolfState from '../../src/middlewares/initializeWolfState'

import { Ability, AbilityFunctionMap, PendingWolfState } from '../../src/types'
// import difference from 'lodash.difference'

import abilityList from './abilities'

import * as addAlarm from './addAlarm'
import * as removeAlarm from './removeAlarm'
import * as listAlarms from './listAlarms'
import * as listAbilities from './listAbilities'

const ksl: AbilityFunctionMap = {
  addAlarm,
  removeAlarm,
  listAlarms,
  listAbilities
}

const restify = require('restify')

// Create server
let server =  restify.createServer()
server.listen(process.env.port || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`)
})

// Create connector
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})

const conversationStore = new ConversationState(new MemoryStorage())

adapter.use(conversationStore)
// Wolf middleware
adapter.use(initializeWolfState(conversationStore))

// for wolf..
const abilities: Ability[] = abilityList

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    try {
      if (context.activity.type !== 'message') {
        return
      }

      const message = context.activity.text
      
      // Load convo state from the store
      const convoState = conversationStore.get(context)

      // TODO: pendingWolfState and wolfState should not have a reference outside of stages
      // TODO: refactor nlp inside of intake
      const pendingWolfState: PendingWolfState = convoState.wolf
      
      let nlpResult: NlpResult
      if (pendingWolfState.waitingFor.slotName) { // bot asked for a question
        nlpResult = {
          intent: pendingWolfState.activeAbility,
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

      // Intake
      const intakeResult = intake(convoState.wolf, nlpResult, 'listAbilities')

      // FillSlot
      const validatedResults: ValidateSlotsResult = validateSlots(abilities, intakeResult)
      const fillSlotResult: FillSlotsResult = fillSlots(abilities, validatedResults)

      // Evaluate
      const evaluateResult: EvaluateResult = evaluate(abilities, ksl, fillSlotResult)
      
      // Action
      const actionResult: ActionResult = action(abilities, ksl, convoState, evaluateResult)

      // Outtake
      const messageArray = outtake(convoState, actionResult)

      // User defined logic to display messages
      const messages: Partial<Activity>[] = messageArray.map((msg) => ({
        type: 'message',
        text: msg
      }))
      await context.sendActivities(messages)

    } catch (err) {
      console.error(err.stack)
    }
  })
})
