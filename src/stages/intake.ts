import { MessageData, NlpResult, IncomingSlotData } from '../types'
import { setMessageData, setDefaultAbility, startIntakeStage } from '../actions'
import { Store } from 'redux'
const logState = require('debug')('wolf:s1:enterState')
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
  { dispatch, getState }: Store,
  nlpResult: NlpResult,
  incomingSlotData: IncomingSlotData[],
  defaultAbility: string | null = null
): void {
  logState(getState())
  dispatch(startIntakeStage())
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

  log('incomingSlotData:', incomingSlotData)
} 
