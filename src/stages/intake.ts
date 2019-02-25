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

  // MessageData derived from user nlpResults

  let messageData: MessageData = { // default empty MessageData object
    rawText: '',
    intent: null,
    entities: []
  }

  // if at least one nlpResult is present, capture first element data
  if (nlpResults.length > 0) {
    messageData = {
      rawText: nlpResults[0].message,
      intent: nlpResults[0].intent,
      entities: nlpResults[0].entities
    }
  }

  // // MessageDataArr derived from user nlpResults
  // const messageDataArr: MessageData[] = nlpResults.map(nlpResult => {
  //   return {
  //     rawText: nlpResult.message,
  //     intent: nlpResult.intent,
  //     entities: nlpResult.entities
  //   }
  // })

  // Write defaultAbility to state
  dispatch(setDefaultAbility(defaultAbility))

  // Write messageData object to state
  dispatch(setMessageData(messageData))

  log('incomingSlotData:', incomingSlotData)
} 
