import { ConversationState, TurnContext } from 'botbuilder'

/**
 * Initialize wolf state
 * 
 * @return Promise<>
 */

export default function initializeWolfState(conversationStore: ConversationState) {
  return {
    onTurn: async (context: TurnContext, next: () => any) => {
      // Load convo state from the store
      const convoState = conversationStore.get(context) || {}

      // Check if wolf state exists
      if (convoState.wolf) {
        await next()
        return
      }

      // Initialize with a default wolf state
      convoState.wolf = {
        abilityCompleted: false,
        activeAbility: '', // default abilityName
        waitingFor: {
          slotName: null,
          turnCount: 0
        },
        messageQueue: [],
        pendingData: {},
        data: {}
      }
      await next()
    }
  }
}
