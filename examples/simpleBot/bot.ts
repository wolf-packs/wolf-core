import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'

// import Wolf middleware
import wolfMiddleware, {getStore, getMessages} from '../../src/middlewares/wolfMiddleware'

import { Ability } from '../../src/types'
// import difference from 'lodash.difference'

import abilityData from './abilities'
import { Store } from '../../node_modules/redux';

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
adapter.use(...wolfMiddleware(conversationStore))

// for wolf..
// const abilities: Ability[] = abilityData as Ability[]

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    try {
      if (context.activity.type !== 'message') {
        return
      }
      

      const messages = getMessages(context)
      // await context.sendActivities(messageActivityArray)

    } catch (err) {
      console.error(err.stack)
    }
  })
})
