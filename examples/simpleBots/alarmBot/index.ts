import * as wolf from '../../../src/'
import abilities, { StorageLayerType, UserState } from './abilities'
import nlp from './nlp'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import slots from './slots';

const port = 8000
const server = express()
const jsonBodyParser = bodyParser.json()

const getInitialWolfState = (): wolf.WolfState => {
  return {
    messageData: { entities: [], intent: null, rawText: '' },
    slotStatus: [],
    slotData: [],
    abilityStatus: [],
    promptedSlotStack: [],
    focusedAbility: null,
    outputMessageQueue: [],
    filledSlotsOnCurrentTurn: [],
    abilitiesCompleteOnCurrentTurn: [],
    defaultAbility: null,
    runOnFillStack: []
  }
}

const defaultStore: UserState = {
  alarms: []
}

const createStorage = <T>(initial: T): StorageLayerType<T> => {
  let data = initial
  return {
    read: () => data,
    save: (newData: T) => {
      data = newData
    }
  }
}

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const flow: wolf.Flow<UserState, StorageLayerType<UserState>> = {
  abilities,
  slots
}

// chatbot endpoint based on the conversation session (per conversationId)
server.post('/messages', jsonBodyParser, async (req, res) => {
  const wolfResult = await wolf.run(
    wolfStorage,
    convoStorage,
    () => nlp(req.body.message),
    () => flow,
    'listAbility'
  )

  let outputMessage
  wolfResult.messageStringArray.forEach(_ => outputMessage += _)

  res.send(outputMessage)
})

server.post('*', jsonBodyParser, (req, res) => {
  res.send('Please use /messages')
})

server.listen(port, () => {
  console.log(`listening on localhost:${port}..`)
})
