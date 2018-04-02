import { Bot, MemoryStorage, BotStateManager } from 'botbuilder'
import { BotFrameworkAdapter } from 'botbuilder-services'
import nlp from './nlp'

// import * as wolf from '../../src'
import intake, {NlpResult, Entity} from '../../src/stages/intake'
import { validateSlots, fillSlots, ValidateSlotsResult, FillSlotsResult } from '../../src/stages/fillSlot'
import evaluate, { EvaluateResult } from '../../src/stages/evaluate'
import action, { ActionResult } from '../../src/stages/actions'
import outtake from '../../src/stages/outtake'

import { Ability, AbilityFunctionMap } from '../../src/types'
// import difference from 'lodash.difference'

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

import abilityList from './abilities'

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

const abilities: Ability[] = abilityList

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
          abilityCompleted: false,
          activeAbility: '', // default abilityName
          waitingFor: {
            slotName: null,
            turnCount: 0
          },
          messageQueue: [],
          pendingData: {},
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

        const pendingWolfState = context.state.conversation.wolf
        
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
        const intakeResult = intake(context.state.conversation.wolf, nlpResult, 'listAbilities')

        // FillSlot
        const validatedResults: ValidateSlotsResult = validateSlots(abilities, intakeResult)
        const fillSlotResult: FillSlotsResult = fillSlots(abilities, validatedResults)

        // Evaluate
        const evaluateResult: EvaluateResult = evaluate(abilities, ksl, fillSlotResult)
        
        // Action
        const actionResult: ActionResult = action(abilities, ksl, context.state, evaluateResult)

        // Outtake
        outtake(context.state.conversation, context.reply.bind(context), actionResult)

      } catch (err) {
        console.error(err.stack)
      }
    })
