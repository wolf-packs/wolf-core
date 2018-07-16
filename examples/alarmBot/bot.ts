import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'
// import { BotFrameworkAdapter } from 'botbuilder-services'
import nlp from './nlp'

// import * as wolf from '../../src'
import intake, { NlpResult } from '../../src/stages/intake'
import fillSlots, { validateSlots, ValidateSlotsResult, FillSlotsResult } from '../../src/stages/fillSlot'
import evaluate, { EvaluateResult } from '../../src/stages/evaluate'
import action, { ActionResult } from '../../src/stages/action'
import outtake, { OuttakeResult } from '../../src/stages/outtake'
import { addMessageToQueue } from '../../src/helpers'

// import Wolf middleware
import initializeWolfState from '../../src/middlewares/initializeWolfState'

import { Ability } from '../../src/types'
// import difference from 'lodash.difference'

import abilityData from './abilities'

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
const abilities: Ability[] = abilityData as Ability[]

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    try {
      if (context.activity.type !== 'message') {
        return
      }

      const userMessage = context.activity.text
      
      // Load convo state from the store
      const convoState = conversationStore.get(context)

      // User defined NLP logic
      // Requirement: user passes an NlpResult object into intake()
      let nlpResult: NlpResult = nlp(userMessage)

      // Intake
      const intakeResult = intake(convoState.wolf, nlpResult, userMessage, 'listAbilities')

      // FillSlot
      const validatedResults: ValidateSlotsResult = validateSlots(abilities, intakeResult)
      const fillSlotResult: FillSlotsResult = fillSlots(abilities, validatedResults)

      // Evaluate
      const evaluateResult: EvaluateResult = evaluate(abilities, fillSlotResult)
      
      // Action
      // const actionResult: ActionResult = action(abilities, ksl, convoState, evaluateResult)

      const { actionResult, runOnComplete }: ActionResult = action(abilities, convoState, evaluateResult)
      const ackMessage: string = await runOnComplete()
      console.log('ackMessage:', ackMessage)
      if (ackMessage) {
        addMessageToQueue(actionResult, ackMessage)
      }

      // Async Action (user defined function)
      // const updatedActionResult = addMessageToQueue(actionResult, 'Async action results...')
      // const messageArray = outtake(convoState, actionResult)

      // Outtake
      const { messageActivityArray }: OuttakeResult = outtake(convoState, actionResult)
      
      // User defined logic to display messages
      await context.sendActivities(messageActivityArray)

    } catch (err) {
      console.error(err.stack)
    }
  })
})
