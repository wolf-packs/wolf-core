import { Bot, MemoryStorage, BotStateManager } from 'botbuilder'
import { BotFrameworkAdapter } from 'botbuilder-services'
import * as wolf from '../../src'
import nlp from './nlp'
import intake, {NlpResult, Entity} from '../../src/intake'
import outtake from '../../src/outtake'
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

        // Intake
        const intakeResult = intake(context.state.conversation.wolf, nlpResult, 'listAlarms')

        // FillSlot
        const validatedResults: ValidateSlotsResult = validateSlots(intakeResult)
        const fillSlotResult: FillSlotsResult = fillSlots(validatedResults)

        // Evaluate
        const evaluateResult: EvaluateResult = evaluate(fillSlotResult)
        
        // Action
        const actionResult: ActionResult = action(context.state, evaluateResult)

        // Outtake
        outtake(context.state.conversation, context.reply.bind(context), actionResult)

      } catch (err) {
        console.error(err)
      }
    })
