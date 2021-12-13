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
    // TODO: Can be refactored to have syntax
    // TODO: Revisit how we are taking in NLP Result (like providing a lib for common NLP providers)
    return {
      rawText: nlpResult.message,
      intent: nlpResult.intent,
      entities: nlpResult.entities
    }
  })

  // TODO: better empty value handling (shouldn't have nonsensical empty values, should be null or undefined)
  // Default empty MessageData object
  // This default object is utilized if the incoming nlpResults array is empty
  let messageData: MessageData = {
    rawText: '',
    intent: null,
    entities: []
  }

  // TODO: Implement multi intent handling
  // If at least one nlpResult is present, capture first element data
  // This is temp code. Future development will require the full messageDataArr to be saved onto WolfState
  if (messageDataArr.length > 0) {
    log(`messageDataArr contains ${messageDataArr.length} elements.`)
    log('Currently only utilizing the first element for messageData.')
    messageData = messageDataArr[0]
  }

  // Write defaultAbility to state
  dispatch(setDefaultAbility(defaultAbility))

  // Write messageData object to state
  dispatch(setMessageData(messageData))

  log('incomingSlotData:', incomingSlotData)
} 
