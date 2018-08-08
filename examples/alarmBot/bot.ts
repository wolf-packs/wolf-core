import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'
import { wolfMiddleware, getMessages, createWolfStore } from '../../src'
import abilities from './abilities'
import nlp from './nlp'
const restify = require('restify')

/**
 * Starting dev tools server
 */
const remotedev = require('remotedev-server')
const { composeWithDevTools } = require('remote-redux-devtools')
remotedev({ hostname: 'localhost', port: 8100 })
const composeEnhancers = composeWithDevTools({ realtime: true, port: 8100, latency: 0 })

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

const conversationState = new ConversationState(new MemoryStorage())

adapter.use(conversationState)
// Wolf middleware
adapter.use(...wolfMiddleware(
  conversationState,
  (context) => nlp(context.activity.text),
  () => abilities,
  'listAbility', // default ability (choose one from your abilities)
  createWolfStore([], composeEnhancers)
))

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
