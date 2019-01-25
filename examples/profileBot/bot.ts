// import { BotFrameworkAdapter, MemoryStorage, ConversationState, Activity, TurnContext } from 'botbuilder'
// import {
//   wolfMiddleware,
//   getMessages,
//   NlpResult,
//   createWolfStore,
//   OutputMessageType,
//   IncomingSlotData,
//   Ability
// } from '../../src'
// import abilities from './abilities'

// const restify = require('restify')

// /**
//  * Bot Boilerplate code
//  */
// // Create server
// let server = restify.createServer()
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

// /**
//  * Set SlotData API memory
//  */
// const apiStorage = new MemoryStorage()

// import { slotDataEndpoint } from './slotDataApi'
// server.use(restify.plugins.bodyParser())
// server.post('/api/slotdata', slotDataEndpoint(apiStorage, abilities))

// /**
//  * User defined data getters for both ability definition and slot data
//  */

// const customSlotDataGetter = async (context: TurnContext): Promise<IncomingSlotData[]> => {
//   // read from apiStorage by conversationId
//   const conversationId = context.activity.conversation.id
//   console.log('conversationId:', conversationId)
//   const slotRawData = await apiStorage.read([conversationId])
//     .then((state) => state)
//     .catch((err) => console.log(err))
//   console.log('slotRawData:', slotRawData)

//   let slotData = []
//   if (slotRawData && slotRawData[conversationId]) {
//     slotData = slotRawData[conversationId].data
//     // Accessed data, delete data..
//     await apiStorage.delete([conversationId])
//   }

//   // return either empty array or slot data from api
//   return slotData
// }

// // Define custom ability getter function
// const customAbilityGetter = (context: TurnContext): Ability[] => {
//   // Delete old abilities cache.. require stores a cache
//   delete require.cache[require.resolve('./abilities')]
//   // Requre new abilities in case there are any changes to ability definition
//   const abilities = require('./abilities')
//   return abilities.default ? abilities.default : abilities
// }

// /**
//  * Add the wolf middleware
//  */

// // Wolf middleware
// adapter.use(
//   ...wolfMiddleware(
//     conversationState,
//     (context) => {
//       const messageData: NlpResult = {
//         message: context.activity.text,
//         intent: context.activity.text === 'hi' ? 'greet' : null,
//         entities: []
//       }
//       return messageData
//     },
//     customAbilityGetter,
//     'greet',
//     createWolfStore(),
//     customSlotDataGetter
//   )
// )

// server.post('/api/messages', (req: any, res: any) => {
//   adapter.processActivity(req, res, async (context) => {
//     try {
//       if (context.activity.type !== 'message') {
//         return
//       }

//       // get messageItemArray that Wolf has created
//       const { messageItemArray } = getMessages(context)

//       // Sort messages with type abilityCompleteMessage to desired order.
//       const desiredOrder = [
//         'greet',
//         'profile'
//       ]

//       const messages: Partial<Activity>[] = messageItemArray
//         .filter(_ => _.type !== OutputMessageType.abilityCompleteMessage)
//         .map(_ => ({
//           type: 'message',
//           text: _.message
//         }))

//       const onCompleteMessage: string = desiredOrder
//         .map(_ => {
//           return messageItemArray.find(item =>
//             item.abilityName === _ && item.type === OutputMessageType.abilityCompleteMessage)
//         })
//         .filter(_ => _)
//         .map(_ => _.message)
//         .join(' ')

//       await context.sendActivities(messages)
//       if (onCompleteMessage) {
//         await context.sendActivities([{
//           type: 'message',
//           text: onCompleteMessage
//         }])
//       }

//     } catch (err) {
//       console.error(err.stack)
//     }
//   })
// })
