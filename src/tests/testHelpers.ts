import {ConvoState, NlpResult, Ability, WolfState} from '../types'
import {Store} from 'redux'
import intake from '../stages/intake'
import fillSlot from '../stages/fillSlot'
import evaluate from '../stages/evaluate'
import execute from '../stages/execute'
import outtake, { OuttakeResult } from '../stages/outtake'

export async function mockWolfRunner (
  conversationStateObjMock: {[key: string]: any},
  inputWolfState: WolfState,
  userMessageData: NlpResult,
  abilities: Ability[],
  defaultAbility: string,
  storeCreator: (wolfStateFromConvoState: {[key: string]: any} | null) => Store<WolfState>,
  // getSlotDataFunc?: (context: TurnContext) => Promiseable<IncomingSlotData[]>
): Promise<{outtakeResult: OuttakeResult, wolfState: WolfState}> {
  const store = storeCreator(inputWolfState)
  const nlpResult: NlpResult = userMessageData
  const convoState: ConvoState = conversationStateObjMock
  // const incomingSlotData: IncomingSlotData[] = getSlotDataFunc ? 
    // await getSlotDataFunc(context) : []
  intake(store, nlpResult, [], defaultAbility)
  fillSlot(store, convoState, abilities)
  evaluate(store, abilities, convoState)
  const executeResult = execute(store, convoState, abilities)

  if (executeResult) {
    const { runOnComplete, addMessage } = executeResult
    const messages = await runOnComplete()
    messages.forEach(addMessage)
  }

  return Promise.resolve({outtakeResult: outtake(store), wolfState: store.getState()})
}

export const getInitialWolfState = (): WolfState => {
  return {
    messageData: {entities: [], intent: null, rawText: ''},
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