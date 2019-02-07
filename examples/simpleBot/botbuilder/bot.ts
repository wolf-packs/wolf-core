// Import Wolf dependency
// import * as wolf from 'wolf-core'
import * as wolf from '../../../src' // Use line above to import after running `npm install wolf-core`

// import Wolf abilities
import { UserState, abilities } from '../abilities'

// import Wolf botbuilder storage layer
import { createBotbuilderStorageLayer } from './storageLayer'

// Bring in Botbuilder dependency
import * as restify from 'restify'
import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'

// Create HTTP server with restify
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}`);
});

// Create adapter (Botbuilder specific)
const adapter = new BotFrameworkAdapter({
  appId: process.env.microsoftAppID,
  appPassword: process.env.microsoftAppPassword,
});

// Settup storage layer
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage)
const conversationStorageLayer = createBotbuilderStorageLayer<UserState>(conversationState)
const wolfStorageLayer = createBotbuilderStorageLayer<wolf.WolfState>(conversationState, 'WOLF_STATE')

// Listen for incoming requests
server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    // Bot logic here
    const wolfResult = await wolf.run(
      wolfStorageLayer(context),
      conversationStorageLayer(context, { name: null }),
      () => ({ message: context.activity.text, entities: [], intent: 'greet' }),
      () => abilities,
      'greet'
    )

    // Respond first message from Wolf
    context.sendActivity(wolfResult.messageStringArray[0])
  });
});
