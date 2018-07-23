import { combineReducers } from 'redux'
import messageData from './messageData'
import abilityStatus from './abilityStatus'
import slotStatus from './slotStatus'
import slotData from './slotData'
import promptedSlotStack from './promptedSlotStack'
import focusedAbility from './focusedAbility'
import outputMessageQueue from './outputMessageQueue'
import filledSlotsOnCurrentTurn from './filledSlotsOnCurrentTurn'

export default combineReducers({
  messageData,
  slotStatus,
  slotData,
  abilityStatus,
  promptedSlotStack,
  focusedAbility,
  outputMessageQueue,
  filledSlotsOnCurrentTurn
})
