import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'
import nlp from './nlp'

import wolfMiddleware, {getStore, getMessages} from '../../src/middlewares/wolfMiddleware'

// import Wolf middleware
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
adapter.use(...wolfMiddleware(
  conversationStore,
  (context) => {
    return nlp(context.activity.text)
  },
  abilities,
  'listAbility',
  {enabled: true} // enable or disable devtool
))

// for wolf..
// const abilities: Ability[] = abilityData as Ability[]

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    try {
      const messages = getMessages(context)
      await context.sendActivities(messages.messageActivityArray)
    } catch (err) {
      console.error(err.stack)
    }
  })
})
