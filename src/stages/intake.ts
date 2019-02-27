import { MessageData, NlpResult, IncomingSlotData } from '../types'
import { setMessageData, setDefaultAbility, startIntakeStage } from '../actions'
import { Store } from 'redux'
const logState = require('debug')('wolf:s1:enterState')
const log = require('debug')('wolf:s1')

/**
 * Intake Stage (S1):
 * 
 * Takes in user generated NlpResult object and creates messageDataArr based on incoming NlpResults, stored to state.
 * 
 * @param nlpResult user generated NLP Object
 * 
 * @returns void
 */
export default function intake(
  { dispatch, getState }: Store,
  nlpResults: NlpResult[],
  incomingSlotData: IncomingSlotData[],
  defaultAbility: string | null = null
): void {
  logState(getState())
  dispatch(startIntakeStage())

  // MessageDataArr derived from user nlpResults
  // Create the messageData array
  const messageDataArr: MessageData[] = nlpResults.map(nlpResult => {
    return {
      rawText: nlpResult.message,
      intent: nlpResult.intent,
      entities: nlpResult.entities
    }
  })

  // Default empty MessageData object
  // This default object is utilized if the incoming nlpResults array is empty
  let messageData: MessageData = {
    rawText: '',
    intent: null,
    entities: []
  }

  // If at least one nlpResult is present, capture first element data
  // This is temp code. Future development will require the full messageDataArr to be saved onto WolfState
  if (messageDataArr.length > 0) {
    messageData = messageDataArr[0]
  }

  // Write defaultAbility to state
  dispatch(setDefaultAbility(defaultAbility))

  // Write messageData object to state
  dispatch(setMessageData(messageData))

  log('incomingSlotData:', incomingSlotData)
} 
