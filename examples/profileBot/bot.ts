import { BotFrameworkAdapter, MemoryStorage, ConversationState, Activity } from 'botbuilder'
import { wolfMiddleware, getMessages, NlpResult, createWolfStore } from '../../src'
import abilities from './abilities'
import { IncomingSlotData, OutputMessageType } from '../../src/types';

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

const conversationState = new ConversationState(new MemoryStorage())

const customSlotDataGetter = (context) => {
  if (conversationState.get(context).name === 'kevin') {
    return []
  }

  return [
    { slotName: 'age', abilityName: 'profile', value: '24' },
    { slotName: 'name', abilityName: 'greet', value: 'kevin' },
    { slotName: 'date', abilityName: 'profile', value: '3/4' }
  ]
}

adapter.use(conversationState)
// Wolf middleware
adapter.use(...wolfMiddleware(conversationState,
  (context) => {
    const messageData: NlpResult = {
      message: context.activity.text,
      intent: context.activity.text === 'hi' ? 'greet' : null,
      entities: []
    }
    return messageData
  },
  (context) => {
    delete require.cache[require.resolve('./abilities')]
    const abilities = require('./abilities')
    return abilities.default ? abilities.default : abilities
  },
  'greet',
  createWolfStore(),
  customSlotDataGetter
)) 

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    try {
      if (context.activity.type !== 'message') {
        return
      }

      const { messageItemArray } = getMessages(context)
      
      const desiredOrder = [
        'greet',
        'profile'
      ]

      const messages: Partial<Activity>[] = messageItemArray
        .filter(_ => _.type !== OutputMessageType.abilityCompleteMessage)
        .map(_ => ({
          type: 'message',
          text: _.message
        }))

      const onCompleteMessage: string = desiredOrder
        .map(_ => {
          return messageItemArray.find(item =>
            item.abilityName === _ && item.type === OutputMessageType.abilityCompleteMessage)
        })
        .filter(_ => _)
        .map(_ => _.message)
        .join(' ')

      await context.sendActivities(messages)
      await context.sendActivities([{
        type: 'message',
        text: onCompleteMessage
      }])

    } catch (err) {
      console.error(err.stack)
    }
  })
})
