// require('dotenv').config() 
// import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'
// import { wolfMiddleware, getMessages, NlpResult, createWolfStore } from '../../src'
// import abilities from './abilities'

// const restify = require('restify')

// // Create server
// let server =  restify.createServer()
// server.listen(process.env.port || 3978, () => {
//   console.log(`${server.name} listening to ${server.url}`)
// })

// // Create connector
// const adapter = new BotFrameworkAdapter({
//   appId: process.env.MICROSOFT_APP_ID,
//   appPassword: process.env.MICROSOFT_APP_PASSWORD
// })

// const conversationState = new ConversationState(new MemoryStorage())

// adapter.use(conversationState)
// // Wolf middleware
// adapter.use(...wolfMiddleware(conversationState,
//   (context) => {
//     const messageData: NlpResult = {
//       message: context.activity.text,
//       intent: context.activity.text === 'hi' ? 'greet' : null,
//       entities: []
//     }
//     return messageData
//   },
//   () => abilities,
//   'greet',
//   createWolfStore()
// )) 

// server.post('/api/messages', (req, res) => {
//   adapter.processActivity(req, res, async (context) => {
//     try {
//       if (context.activity.type !== 'message') {
//         return
//       }

//       const messages = getMessages(context)
//       await context.sendActivities(messages.messageActivityArray)

//     } catch (err) {
//       console.error(err.stack)
//     }
//   })
// })
