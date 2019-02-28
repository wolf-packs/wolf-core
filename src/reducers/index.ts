import { combineReducers } from 'redux'
import messageData from './messageData'
import abilityStatus from './abilityStatus'
import slotStatus from './slotStatus'
import slotData from './slotData'
import promptedSlotStack from './promptedSlotStack'
import focusedAbility from './focusedAbility'
import outputMessageQueue from './outputMessageQueue'
import filledSlotsOnCurrentTurn from './filledSlotsOnCurrentTurn'
import defaultAbility from './defaultAbility'
import abilitiesCompleteOnCurrentTurn from './abilitiesCompleteOnCurrentTurn'
import runOnFillStack from './runOnFillStack'
import slotRecords from './slotRecords'

export default combineReducers({
  messageData,
  slotStatus,
  slotData,
  slotRecords,
  abilityStatus,
  promptedSlotStack,
  focusedAbility,
  outputMessageQueue,
  filledSlotsOnCurrentTurn,
  defaultAbility,
  abilitiesCompleteOnCurrentTurn,
  runOnFillStack
})
