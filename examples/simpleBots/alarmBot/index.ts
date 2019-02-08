// import * as wolf from 'wolf-core'
// import { WolfStorage } from 'wolf-core'
// import abilities from './abilities'
// import nlp from './nlp'
// import * as express from 'express'
// import * as bodyParser from 'body-parser'
// import * as uuid from 'uuid/v1'

// interface PersistedState<T> {
//   wolfState: WolfStorage,
//   conversationState: T
// }

// const port = 8000
// const server = express()
// const jsonBodyParser = bodyParser.json()
// const persistentStorage = new Map()

// // first middleware loads in conversation session data
// const inMemoryMiddleware = <T>(container: Map<string, PersistedState<T>>) =>
//   async (req, res, next) => {
//     // get the conversation and wolf state by conservationId
//     const conversationId = req.body.conversationId
//     const result = container.get(conversationId)
//     const {
//       wolfState: oldWolfState,
//       conversationState: oldConversationState
//     } = result ? result : { wolfState: null, conversationState: {} }

//     res.locals.wolfState = oldWolfState
//     res.locals.conversationState = oldConversationState
//     res.locals.conversationId = conversationId
//     next()
//   }

// // second middleware executes wolf with the state data
// const botResponse = async (req, res, next) => {
//   const message = req.body.message
//   const wolfState = res.locals.wolfState
//   const conversationState = res.locals.conversationState
//   const userMessageData = () => nlp(message)
//   const abilitiesGetter = () => abilities
//   const defaultAbility = 'listAbility'

//   // run Wolf
//   const { wolfResult, retrieveWolfState, retrieveConversationState } = await wolf.run<any>(
//     conversationState, wolfState, userMessageData, abilitiesGetter, defaultAbility)

//   // retrieve state to be persisted through conversation
//   const updatedState = retrieveWolfState()
//   const updatedConversationState = retrieveConversationState()

//   res.locals.wolfState = updatedState
//   res.locals.conversationState = updatedConversationState

//   res.send(`${JSON.stringify(wolfResult.messageStringArray)}`)
// }

// // third middleware saves the updated state data back into persistent storage
// const saveMiddleware = <T>(container: Map<string, PersistedState<T>>) =>
//   (req, res, next) => {
//     // save the conversation and wolf state by conversationId
//     const { wolfState, conversationState, conversationId } = res.locals
//     container.set(conversationId, { wolfState, conversationState })
//   }

// // issues a new conversationId unique to the conversation session
// server.post('/conversations', (req, res) => {
//   res.send({ conversationId: uuid() })
// })

// // chatbot endpoint based on the conversation session (per conversationId)
// server.post('/messages', jsonBodyParser, inMemoryMiddleware(persistentStorage),
//   botResponse, saveMiddleware(persistentStorage))
// server.post('*', jsonBodyParser, (req, res) => {
//   res.send('Please use /messages')
// })

// server.listen(port, () => {
//   console.log(`listening on localhost:${port}..`)
// })
