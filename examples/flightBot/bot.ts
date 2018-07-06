import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'

const restify = require('restify')

// Create server
let server = restify.createServer()
server.listen(process.env.port || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`)
})

// Create connector
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, (context) => {
    try {
      if (context.activity.type !== 'message') {
        return
      }
    } catch (err) {
      context.sendActivity('hello')
    }
  })
})
