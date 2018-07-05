import { ConversationState, TurnContext } from 'botbuilder'

/**
* Initialize wolf state
* 
* @return Promise<>
*/

export default function initializeWolfState(conversationState: ConversationState) {
  return {
    onTurn: async (context: TurnContext, next: () => any) => {
      // This simple middleware reports the activity type and if we responded
      const state = conversationState.get(context) || {}

      // Check if wolf state exists
      if(state.wolf) {
        await next()
        return
      }

      state.wolf = {
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
