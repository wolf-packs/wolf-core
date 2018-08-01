import { MessageData, NlpResult } from '../types'
import { setMessageData, setDefaultAbility }  from '../actions'
import { Store } from 'redux'
const log = require('debug')('wolf:s1')

/**
 * Intake Stage (S1):
 * 
 * Takes in user generated NlpResult object and creates messageData object, stored to state.
 * 
 * @param nlpResult user generated NLP Object
 * 
 * @returns void
 */
export default function intake(
  {dispatch, getState}: Store,
  nlpResult: NlpResult,
  defaultAbility: string | null = null
): void {
  log('enter', getState())
  // MessageData derived from user nlpResult
  const messageData: MessageData = {
    rawText: nlpResult.message,
    intent: nlpResult.intent,
    entities: nlpResult.entities
  }

  // Write defaultAbility to state
  dispatch(setDefaultAbility(defaultAbility))

  // Write messageData object to state
  dispatch(setMessageData(messageData))
} 
