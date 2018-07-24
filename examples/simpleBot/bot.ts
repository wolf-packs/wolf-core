import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'
import { NlpResult } from '../../src/types'

// import Wolf middleware
import wolfMiddleware, {getStore, getMessages} from '../../src/middlewares/wolfMiddleware'

import { Ability, MessageData } from '../../src/types'

// import difference from 'lodash.difference'

import abilities from './abilities'

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
adapter.use(...wolfMiddleware(conversationStore, (context) => {
  const messageData: NlpResult = {
    message: context.activity.text,
    intent: context.activity.text === 'hi' ? 'greet' : null,
    entities: []
  }
  return messageData
}, abilities, {enabled: true}))

// for wolf..
// const abilities: Ability[] = abilityData as Ability[]

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    try {
      if (context.activity.type !== 'message') {
        return
      }

      const messages = getMessages(context)
      await context.sendActivities(messages.messageActivityArray)

    } catch (err) {
      console.error(err.stack)
    }
  })
})
